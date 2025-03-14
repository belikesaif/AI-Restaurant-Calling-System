
import type { TranscriptionResult } from "../types";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

interface TranscriptionResultProps {
  result: TranscriptionResult;
}

const TranscriptionResult = ({ result }: TranscriptionResultProps) => {
  const { transcript, response } = result;
  
  // Parse the response to extract menu categories
  const parseMenuResponse = () => {
    try {
      const lines = response.split('\n');
      const recommendationsIndex = lines.findIndex(line => 
        line.includes("Based on our menu, here are some recommendations:"));
      
      if (recommendationsIndex === -1) return [];
      
      const menuLines = lines.slice(recommendationsIndex + 1);
      const categories = [];
      
      for (const line of menuLines) {
        if (line.startsWith('•')) {
          const [categoryPart, itemsPart] = line.substring(2).split(':');
          if (categoryPart && itemsPart) {
            categories.push({
              name: categoryPart.trim(),
              items: itemsPart.split(',').map(item => item.trim())
            });
          }
        }
      }
      
      return categories;
    } catch (error) {
      console.error("Error parsing menu response:", error);
      return [];
    }
  };
  
  const menuCategories = parseMenuResponse();

  return (
    <div className="w-full max-w-3xl mx-auto space-y-6 animate-slide-up">
      <Card className="overflow-hidden shadow-lg bg-white border-0">
        <CardHeader className="bg-primary/5 pb-2">
          <Badge className="mb-2 self-start" variant="outline">Transcription</Badge>
          <CardTitle className="text-lg font-medium">
            Customer Request
          </CardTitle>
        </CardHeader>
        <CardContent className="pt-6">
          <p className="text-base leading-relaxed">{transcript}</p>
        </CardContent>
      </Card>
      
      <Card className="overflow-hidden shadow-lg bg-white border-0">
        <CardHeader className="bg-primary/5 pb-2">
          <Badge className="mb-2 self-start" variant="outline">Recommendations</Badge>
          <CardTitle className="text-lg font-medium">
            Menu Suggestions
          </CardTitle>
        </CardHeader>
        <CardContent className="pt-6">
          <div className="grid gap-6 md:grid-cols-2">
            {menuCategories.map((category, index) => (
              <div key={index} className="space-y-3">
                <h3 className="font-medium text-gray-900">{category.name}</h3>
                <ul className="space-y-1">
                  {category.items.map((item, itemIndex) => (
                    <li key={itemIndex} className="flex items-center">
                      <span className="inline-block w-1.5 h-1.5 rounded-full bg-primary mr-2"></span>
                      {item}
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
          
          <div className="mt-6 pt-6 border-t text-center text-muted-foreground">
            Thank you for choosing our restaurant. We look forward to serving you!
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default TranscriptionResult;
