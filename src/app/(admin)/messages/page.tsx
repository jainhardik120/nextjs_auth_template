import { api } from "@/trpc/server";

export default async function Page() {
  const messages = await api.contact.listMessages();
  return (
    <div>
      {messages.map((message) => {
        return (
          <div key={message.id}>
            <h1>{message.subject}</h1>
            <p>{message.email}</p>
            <p>{message.message}</p>
          </div>
        );
      })}
    </div>
  );
}
