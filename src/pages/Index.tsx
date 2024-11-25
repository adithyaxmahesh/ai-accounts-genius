import { OpenAITest } from "@/components/OpenAITest";

export default function Index() {
  return (
    <div className="container mx-auto p-4">
      <h1 className="text-2xl font-bold mb-4">Test OpenAI</h1>
      <OpenAITest />
    </div>
  );
}