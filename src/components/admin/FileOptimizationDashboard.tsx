import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { 
  HardDrive, 
  Zap, 
  Image, 
  TrendingDown, 
  RefreshCw, 
  Play,
  Eye,
  CheckCircle,
  AlertCircle,
  Loader2,
  Sparkles
} from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useFileOptimization } from "@/hooks/useFileOptimization";
import { useToast } from "@/hooks/use-toast";

interface OptimizationLog {
  id: string;
  original_url: string;
  optimized_url: string;
  original_size: number;
  optimized_size: number;
  compression_ratio: number;
  was_enhanced: boolean;
  target_type: string;
  created_at: string;
}

interface BatchJob {
  id: string;
  files_processed: number;
  files_failed: number;
  files_skipped: number;
  space_saved: number;
  compression_ratio: number;
  status: string;
  created_at: string;
}

const FileOptimizationDashboard = () => {
  const { toast } = useToast();
  const { runBatchOptimization, getOptimizationStats, isOptimizing, progress } = useFileOptimization();
  
  const [stats, setStats] = useState({
    totalFiles: 0,
    spaceSaved: 0,
    avgCompression: 0,
    filesEnhanced: 0
  });
  const [recentLogs, setRecentLogs] = useState<OptimizationLog[]>([]);
  const [batchJobs, setBatchJobs] = useState<BatchJob[]>([]);
  const [loading, setLoading] = useState(true);
  const [dryRunResult, setDryRunResult] = useState<any>(null);

  const fetchData = async () => {
    setLoading(true);
    try {
      // Fetch stats
      const statsResult = await getOptimizationStats();
      if (statsResult) {
        setStats({
          totalFiles: statsResult.totalFilesProcessed,
          spaceSaved: statsResult.totalSpaceSaved,
          avgCompression: statsResult.averageCompression,
          filesEnhanced: statsResult.filesEnhanced
        });
      }

      // Fetch recent logs
      const { data: logs } = await supabase
        .from('file_optimization_logs')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(10);
      
      if (logs) setRecentLogs(logs);

      // Fetch batch jobs
      const { data: jobs } = await supabase
        .from('batch_optimization_jobs')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(5);
      
      if (jobs) setBatchJobs(jobs);
    } catch (error) {
      console.error('Failed to fetch optimization data:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleDryRun = async () => {
    const result = await runBatchOptimization(100, 512000, true);
    if (result) {
      setDryRunResult(result);
      toast({
        title: "Scan Complete",
        description: `Found ${result.filesToOptimize} files to optimize (${result.estimatedSavings} estimated savings)`
      });
    }
  };

  const handleRunOptimization = async () => {
    const result = await runBatchOptimization(50, 512000, false);
    if (result) {
      fetchData();
    }
  };

  const formatBytes = (bytes: number): string => {
    if (bytes === 0) return '0 B';
    const k = 1024;
    const sizes = ['B', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(1)) + ' ' + sizes[i];
  };

  const formatDate = (dateStr: string) => {
    return new Date(dateStr).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center p-8">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold flex items-center gap-2">
            <Sparkles className="h-6 w-6 text-primary" />
            AI File Optimization
          </h2>
          <p className="text-muted-foreground">
            Automatically compress, resize, and enhance images for optimal performance
          </p>
        </div>
        <Button variant="outline" onClick={fetchData}>
          <RefreshCw className="h-4 w-4 mr-2" />
          Refresh
        </Button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-3">
              <div className="p-3 rounded-xl bg-primary/10">
                <Image className="h-6 w-6 text-primary" />
              </div>
              <div>
                <p className="text-2xl font-bold">{stats.totalFiles}</p>
                <p className="text-sm text-muted-foreground">Files Processed</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-3">
              <div className="p-3 rounded-xl bg-green-500/10">
                <HardDrive className="h-6 w-6 text-green-500" />
              </div>
              <div>
                <p className="text-2xl font-bold">{formatBytes(stats.spaceSaved)}</p>
                <p className="text-sm text-muted-foreground">Space Saved</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-3">
              <div className="p-3 rounded-xl bg-blue-500/10">
                <TrendingDown className="h-6 w-6 text-blue-500" />
              </div>
              <div>
                <p className="text-2xl font-bold">{stats.avgCompression}%</p>
                <p className="text-sm text-muted-foreground">Avg Compression</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-3">
              <div className="p-3 rounded-xl bg-purple-500/10">
                <Zap className="h-6 w-6 text-purple-500" />
              </div>
              <div>
                <p className="text-2xl font-bold">{stats.filesEnhanced}</p>
                <p className="text-sm text-muted-foreground">AI Enhanced</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Batch Optimization Controls */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Play className="h-5 w-5" />
            Batch Optimization
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <p className="text-muted-foreground">
            Scan and optimize all existing files in storage that are larger than 500KB.
          </p>
          
          {isOptimizing && (
            <div className="space-y-2">
              <div className="flex items-center justify-between text-sm">
                <span>Processing...</span>
                <span>{progress}%</span>
              </div>
              <Progress value={progress} />
            </div>
          )}

          {dryRunResult && (
            <div className="bg-muted/50 rounded-xl p-4 space-y-2">
              <h4 className="font-medium">Scan Results:</h4>
              <div className="grid grid-cols-2 gap-2 text-sm">
                <span className="text-muted-foreground">Total files:</span>
                <span>{dryRunResult.totalFiles}</span>
                <span className="text-muted-foreground">Files to optimize:</span>
                <span className="text-primary font-medium">{dryRunResult.filesToOptimize}</span>
                <span className="text-muted-foreground">Estimated savings:</span>
                <span className="text-green-500 font-medium">{dryRunResult.estimatedSavings}</span>
              </div>
            </div>
          )}

          <div className="flex gap-3">
            <Button 
              variant="outline" 
              onClick={handleDryRun}
              disabled={isOptimizing}
            >
              <Eye className="h-4 w-4 mr-2" />
              Scan Files (Dry Run)
            </Button>
            <Button 
              onClick={handleRunOptimization}
              disabled={isOptimizing}
            >
              {isOptimizing ? (
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
              ) : (
                <Zap className="h-4 w-4 mr-2" />
              )}
              Run Optimization
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Recent Jobs */}
      {batchJobs.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Recent Batch Jobs</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {batchJobs.map(job => (
                <div 
                  key={job.id}
                  className="flex items-center justify-between p-3 bg-muted/30 rounded-xl"
                >
                  <div className="flex items-center gap-3">
                    {job.status === 'completed' ? (
                      <CheckCircle className="h-5 w-5 text-green-500" />
                    ) : (
                      <AlertCircle className="h-5 w-5 text-yellow-500" />
                    )}
                    <div>
                      <p className="font-medium">
                        {job.files_processed} files processed
                      </p>
                      <p className="text-sm text-muted-foreground">
                        {formatDate(job.created_at)}
                      </p>
                    </div>
                  </div>
                  <div className="text-right">
                    <Badge variant={job.compression_ratio > 50 ? "default" : "secondary"}>
                      {job.compression_ratio}% saved
                    </Badge>
                    <p className="text-sm text-muted-foreground mt-1">
                      {formatBytes(job.space_saved)}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Recent Optimization Logs */}
      <Card>
        <CardHeader>
          <CardTitle>Recent Optimizations</CardTitle>
        </CardHeader>
        <CardContent>
          {recentLogs.length === 0 ? (
            <p className="text-center text-muted-foreground py-8">
              No optimizations yet. Upload files to see them here.
            </p>
          ) : (
            <div className="space-y-3">
              {recentLogs.map(log => (
                <div 
                  key={log.id}
                  className="flex items-center gap-4 p-3 bg-muted/30 rounded-xl"
                >
                  <div className="w-16 h-16 rounded-lg overflow-hidden bg-muted flex-shrink-0">
                    <img 
                      src={log.optimized_url} 
                      alt="" 
                      className="w-full h-full object-cover"
                      onError={(e) => {
                        (e.target as HTMLImageElement).src = '/placeholder.svg';
                      }}
                    />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <Badge variant="outline" className="text-xs">
                        {log.target_type}
                      </Badge>
                      {log.was_enhanced && (
                        <Badge variant="secondary" className="text-xs">
                          <Sparkles className="h-3 w-3 mr-1" />
                          Enhanced
                        </Badge>
                      )}
                    </div>
                    <p className="text-sm text-muted-foreground mt-1">
                      {formatBytes(log.original_size)} → {formatBytes(log.optimized_size)}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      {formatDate(log.created_at)}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="text-lg font-bold text-green-500">
                      -{log.compression_ratio}%
                    </p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default FileOptimizationDashboard;
