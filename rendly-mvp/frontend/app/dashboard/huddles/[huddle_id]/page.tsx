export default function HuddlePage({
  params,
}: {
  params: { huddle_id: string };
}) {
  return (
    <div>
      <h1>Huddle {params.huddle_id}</h1>
    </div>
  );
}
