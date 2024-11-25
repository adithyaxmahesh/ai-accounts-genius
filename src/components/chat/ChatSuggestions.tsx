export const ChatSuggestions = () => {
  return (
    <div className="text-sm text-muted-foreground p-4">
      <p>You can ask questions like:</p>
      <ul className="list-disc list-inside mt-2 space-y-1">
        <li>"What was my largest expense last month?"</li>
        <li>"How can I optimize my tax deductions?"</li>
        <li>"What vehicle expenses can I write off?"</li>
        <li>"Show me my tax savings opportunities"</li>
        <li>"Calculate my estimated quarterly taxes"</li>
        <li>"Analyze my business expense patterns"</li>
      </ul>
    </div>
  );
};