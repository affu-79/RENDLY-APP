export default function ConversationPage({
  params,
}: {
  params: { conversation_id: string };
}) {
  return (
    <div>
      <h1>Conversation {params.conversation_id}</h1>
    </div>
  );
}
