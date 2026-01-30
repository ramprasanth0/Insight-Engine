import { ChatBox } from "@/components/chat-box";
import { ChatInput } from "@/components/chat-input";

export default function Home() {
  return (
    <div className="">
      <main className="">
        <h1 className="">Insight Engine</h1>
        <ChatBox />
        <ChatInput />
      </main>
    </div>
  );
}
