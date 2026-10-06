import mongoose from 'mongoose';

export const CMS_MODULES = [
  'banners',
  'faqs',
  'testimonials',
  'moods',
  'seasonal',
  'home-sections',
  'why-reasons',
  'map-locations',
  'trip-planner-steps',
  'search-sections',
  'search-categories',
  'search-popular',
];

/** One `home-sections` record per key; `data.key` identifies the home page section it configures. */
export const HOME_SECTION_KEYS = [
  'hero',
  'trip-planner',
  'destinations',
  'story',
  'moods',
  'tours',
  'experiences',
  'map',
  'why',
  'seasonal',
  'testimonials',
  'journal',
  'faqs',
  'final-cta',
];

/** One `search-sections` record per key; `results` holds the search box and result labels. */
export const SEARCH_SECTION_KEYS = ['hero', 'results', 'categories', 'cta'];

/** Section modules whose records are keyed by `data.key` (one record per key). */
export const SECTION_MODULE_KEYS = {
  'home-sections': HOME_SECTION_KEYS,
  'search-sections': SEARCH_SECTION_KEYS,
};

const schema = new mongoose.Schema({
  module:{type:String,required:true,index:true},
  title:{type:String,required:true,trim:true,maxlength:200},
  status:{type:String,enum:['active','inactive'],default:'active',index:true},
  sortOrder:{type:Number,default:0},
  data:{type:mongoose.Schema.Types.Mixed,default:{}},
  createdBy:{type:mongoose.Schema.Types.ObjectId,ref:'User'},
},{timestamps:true});
schema.index({module:1,createdAt:-1});
schema.index({module:1,status:1,sortOrder:1});
export default mongoose.model('AdminRecord',schema);
