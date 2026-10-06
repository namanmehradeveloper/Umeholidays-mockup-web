import PlannerAdmin from '../../../../components/admin/planner/PlannerAdmin';

export default async function Page({ params }: { params: Promise<{ tab: string }> }) {
  const { tab } = await params;
  return <PlannerAdmin tab={tab} />;
}
