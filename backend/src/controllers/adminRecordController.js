import mongoose from 'mongoose';
import AdminRecord, { CMS_MODULES, SECTION_MODULE_KEYS } from '../models/AdminRecord.js';
import ApiError from '../utils/ApiError.js';
import { sendSuccess } from '../utils/response.js';
import { auditAdmin } from '../utils/audit.js';
import { asString, paginationMeta } from '../utils/query.js';

export const ADMIN_RECORD_MODULES = new Set(CMS_MODULES);

const RECORD_SORT = { sortOrder: 1, createdAt: -1 };

function assertModule(module) {
  if (!ADMIN_RECORD_MODULES.has(module)) throw ApiError.notFound('CMS module not found');
}

function parseSortOrder(value) {
  if (value === undefined || value === null || value === '') return undefined;
  const number = Number(value);
  if (!Number.isFinite(number)) throw ApiError.badRequest('sortOrder must be a number');
  return number;
}

async function assertSectionKey(module, data, excludeId) {
  const keys = SECTION_MODULE_KEYS[module];
  if (!keys) return;

  const key = data?.key;
  if (!keys.includes(key)) {
    throw ApiError.badRequest(`data.key must be one of: ${keys.join(', ')}`);
  }

  const filter = { module, 'data.key': key };
  if (excludeId) filter._id = { $ne: excludeId };
  if (await AdminRecord.exists(filter)) {
    throw ApiError.conflict(`Section "${key}" already exists`);
  }
}

async function nextSortOrder(module) {
  const last = await AdminRecord.findOne({ module }).sort({ sortOrder: -1 }).select('sortOrder').lean();
  return (Number(last?.sortOrder) || 0) + 1;
}

export async function listRecords(req,res){
  const module=req.params.module; assertModule(module);
  const q=asString(req.query.q);
  const page=Math.max(1, Number.parseInt(asString(req.query.page),10)||1);
  const limit=Math.min(200, Math.max(1, Number.parseInt(asString(req.query.limit),10)||100));
  const filter={module};
  if(q) filter.title={$regex:q.replace(/[.*+?^${}()|[\]\\]/g,'\\$&'),$options:'i'};
  const [data,total]=await Promise.all([
    AdminRecord.find(filter).sort(RECORD_SORT).skip((page-1)*limit).limit(limit),
    AdminRecord.countDocuments(filter),
  ]);
  return sendSuccess(res,{data,meta:paginationMeta({page,limit},total)});
}
export async function getRecord(req,res){
  const module=req.params.module; assertModule(module);
  const doc=await AdminRecord.findOne({_id:req.params.id,module});
  if(!doc)throw ApiError.notFound('Record not found');
  return sendSuccess(res,{data:doc});
}
export async function createRecord(req,res){
  const module=req.params.module; assertModule(module);
  const {title,status,data={}}=req.body;
  if(!title)throw ApiError.badRequest('title is required');
  await assertSectionKey(module, data);
  const sortOrder = parseSortOrder(req.body.sortOrder) ?? await nextSortOrder(module);
  const doc=await AdminRecord.create({module,title,status:status || 'active',sortOrder,data,createdBy:req.user._id});
  await auditAdmin(req,{action:'create',module,recordId:doc._id});
  return sendSuccess(res,{status:201,message:'Record created',data:doc});
}
export async function updateRecord(req,res){
  const module=req.params.module; assertModule(module);
  const doc=await AdminRecord.findOne({_id:req.params.id,module});
  if(!doc)throw ApiError.notFound('Record not found');
  const allowed={};
  for(const field of ['title','status','data']) if(req.body[field]!==undefined) allowed[field]=req.body[field];
  const sortOrder = parseSortOrder(req.body.sortOrder);
  if (sortOrder !== undefined) allowed.sortOrder = sortOrder;
  if(!Object.keys(allowed).length)throw ApiError.badRequest('No valid fields provided');
  if (allowed.data !== undefined) await assertSectionKey(module, allowed.data, doc._id);
  doc.set(allowed); await doc.save();
  await auditAdmin(req,{action:'update',module,recordId:doc._id,meta:{fields:Object.keys(allowed)}});
  return sendSuccess(res,{message:'Record updated',data:doc});
}
export async function reorderRecords(req,res){
  const module=req.params.module; assertModule(module);
  const ids = Array.isArray(req.body?.ids) ? req.body.ids.map(String) : null;
  if (!ids?.length || ids.some((id) => !mongoose.isValidObjectId(id))) {
    throw ApiError.badRequest('ids must be a non-empty array of record ids');
  }
  const result = await AdminRecord.bulkWrite(ids.map((id, index) => ({
    updateOne: { filter: { _id: id, module }, update: { $set: { sortOrder: index + 1 } } },
  })));
  await auditAdmin(req,{action:'update',module,meta:{reordered:ids.length}});
  return sendSuccess(res,{message:'Order updated',data:{matched:result.matchedCount}});
}
export async function deleteRecord(req,res){
  const module=req.params.module; assertModule(module);
  const result=await AdminRecord.deleteOne({_id:req.params.id,module});
  if(!result.deletedCount)throw ApiError.notFound('Record not found');
  await auditAdmin(req,{action:'delete',module,recordId:req.params.id});
  return sendSuccess(res,{message:'Record deleted'});
}
