import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ChevronDown, ChevronUp, Code } from 'lucide-react';
import { DebugData, FeatureVector } from '@/lib/predictionEngine';

interface DebugPanelProps {
  debugData: DebugData;
}

export const DebugPanel = ({ debugData }: DebugPanelProps) => {
  const [isOpen, setIsOpen] = useState(false);
  const [activeTab, setActiveTab] = useState<'features' | 'scores' | 'thresholds'>('features');

  return (
    <Card className="border-dashed border-muted-foreground/30">
      <CardHeader 
        className="cursor-pointer py-3" 
        onClick={() => setIsOpen(!isOpen)}
      >
        <div className="flex items-center justify-between">
          <CardTitle className="text-sm flex items-center gap-2 text-muted-foreground">
            <Code className="h-4 w-4" />
            Developer / Research Debug Panel
          </CardTitle>
          <Button variant="ghost" size="sm" className="h-6 w-6 p-0">
            {isOpen ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
          </Button>
        </div>
      </CardHeader>
      
      {isOpen && (
        <CardContent className="pt-0">
          <div className="flex gap-2 mb-4">
            <Button
              variant={activeTab === 'features' ? 'default' : 'outline'}
              size="sm"
              onClick={() => setActiveTab('features')}
            >
              Feature Vector
            </Button>
            <Button
              variant={activeTab === 'scores' ? 'default' : 'outline'}
              size="sm"
              onClick={() => setActiveTab('scores')}
            >
              Raw Scores
            </Button>
            <Button
              variant={activeTab === 'thresholds' ? 'default' : 'outline'}
              size="sm"
              onClick={() => setActiveTab('thresholds')}
            >
              Thresholds
            </Button>
          </div>

          <div className="bg-muted rounded-lg p-4 overflow-auto max-h-96">
            {activeTab === 'features' && (
              <div>
                <h4 className="font-mono text-sm font-semibold mb-2">Feature Vector (Normalized)</h4>
                <pre className="text-xs font-mono whitespace-pre-wrap">
                  {JSON.stringify(debugData.featureVector, null, 2)}
                </pre>
              </div>
            )}

            {activeTab === 'scores' && (
              <div>
                <h4 className="font-mono text-sm font-semibold mb-2">Raw Risk Scores</h4>
                <div className="space-y-2">
                  <div className="flex justify-between items-center p-2 bg-background rounded">
                    <span className="font-mono text-sm">Pancreatic:</span>
                    <span className="font-mono text-sm font-bold">{debugData.rawScores.pancreatic.toFixed(4)}</span>
                  </div>
                  <div className="flex justify-between items-center p-2 bg-background rounded">
                    <span className="font-mono text-sm">Colon:</span>
                    <span className="font-mono text-sm font-bold">{debugData.rawScores.colon.toFixed(4)}</span>
                  </div>
                  <div className="flex justify-between items-center p-2 bg-background rounded">
                    <span className="font-mono text-sm">Blood:</span>
                    <span className="font-mono text-sm font-bold">{debugData.rawScores.blood.toFixed(4)}</span>
                  </div>
                </div>
                <div className="mt-4 text-xs text-muted-foreground">
                  <p>Data Completeness: {(debugData.dataCompleteness * 100).toFixed(0)}%</p>
                  <p>Timestamp: {debugData.timestamp}</p>
                  <p>Version: {debugData.version}</p>
                </div>
              </div>
            )}

            {activeTab === 'thresholds' && (
              <div>
                <h4 className="font-mono text-sm font-semibold mb-2">Classification Thresholds</h4>
                <table className="w-full text-sm font-mono">
                  <thead>
                    <tr className="text-left">
                      <th className="p-2">Threshold</th>
                      <th className="p-2">Value</th>
                      <th className="p-2">Description</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr className="border-t border-border">
                      <td className="p-2">Low Risk</td>
                      <td className="p-2">&lt; {debugData.thresholds.lowRisk}</td>
                      <td className="p-2 text-muted-foreground">Score below this = Low</td>
                    </tr>
                    <tr className="border-t border-border">
                      <td className="p-2">Medium Risk</td>
                      <td className="p-2">&lt; {debugData.thresholds.mediumRisk}</td>
                      <td className="p-2 text-muted-foreground">Score below this = Medium</td>
                    </tr>
                    <tr className="border-t border-border">
                      <td className="p-2">High Risk</td>
                      <td className="p-2">≥ {debugData.thresholds.mediumRisk}</td>
                      <td className="p-2 text-muted-foreground">Score at or above = High</td>
                    </tr>
                    <tr className="border-t border-border">
                      <td className="p-2">Low Confidence</td>
                      <td className="p-2">&lt; {debugData.thresholds.lowConfidence}</td>
                      <td className="p-2 text-muted-foreground">Confidence score below this</td>
                    </tr>
                    <tr className="border-t border-border">
                      <td className="p-2">Medium Confidence</td>
                      <td className="p-2">&lt; {debugData.thresholds.mediumConfidence}</td>
                      <td className="p-2 text-muted-foreground">Confidence score below this</td>
                    </tr>
                  </tbody>
                </table>
              </div>
            )}
          </div>

          <div className="mt-4 text-xs text-muted-foreground">
            <p className="font-semibold">Note for Researchers:</p>
            <p>This debug panel exposes the internal feature vector and scoring mechanism. 
            The feature vector can be used directly for ML model training. Raw scores are 
            before threshold application. Thresholds can be adjusted for different 
            sensitivity/specificity trade-offs.</p>
          </div>
        </CardContent>
      )}
    </Card>
  );
};
