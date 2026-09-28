"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { 
  Database, Download, Upload, Clock, CheckCircle, 
  AlertCircle, HardDrive, RefreshCw, Shield, Trash2
} from "lucide-react";
import { useState } from "react";
import { triggerBackup, triggerRestore } from "@/app/actions/backup";
import { toast } from "sonner";

interface Backup {
  id: string;
  name: string;
  size: string;
  created_at: string;
  type: "full" | "partial";
  status: "completed" | "in_progress" | "failed";
  location: "local" | "cloud";
}

const BACKUPS: Backup[] = [
  { id: "1", name: "Full Backup - May 5, 2025", size: "2.4 GB", created_at: "2025-05-05 02:00", type: "full", status: "completed", location: "cloud" },
  { id: "2", name: "Incremental - May 4, 2025", size: "145 MB", created_at: "2025-05-04 02:00", type: "partial", status: "completed", location: "cloud" },
  { id: "3", name: "Full Backup - May 3, 2025", size: "2.3 GB", created_at: "2025-05-03 02:00", type: "full", status: "completed", location: "cloud" },
  { id: "4", name: "Incremental - May 2, 2025", size: "132 MB", created_at: "2025-05-02 02:00", type: "partial", status: "completed", location: "cloud" },
  { id: "5", name: "Full Backup - May 1, 2025", size: "2.2 GB", created_at: "2025-05-01 02:00", type: "full", status: "completed", location: "local" },
];

const SCHEDULE_OPTIONS = [
  { id: "daily", name: "Daily", description: "Every day at 2:00 AM" },
  { id: "weekly", name: "Weekly", description: "Every Sunday at 2:00 AM" },
  { id: "monthly", name: "Monthly", description: "1st of every month" },
  { id: "custom", name: "Custom", description: "Custom schedule" },
];

export function BackupRestore() {
  const [backupInProgress, setBackupInProgress] = useState(false);
  const [restoreInProgress, setRestoreInProgress] = useState(false);
  const [progress, setProgress] = useState(0);

  const startBackup = async () => {
    setBackupInProgress(true);
    setProgress(0);
    
    const result = await triggerBackup();
    if (!result.success) {
      toast.error(result.error);
      setBackupInProgress(false);
      return;
    }

    const interval = setInterval(() => {
      setProgress(prev => {
        if (prev >= 100) {
          clearInterval(interval);
          setBackupInProgress(false);
          toast.success("Backup completed successfully");
          return 100;
        }
        return prev + 10;
      });
    }, 500);
  };

  const startRestore = async () => {
    setRestoreInProgress(true);
    setProgress(0);

    // For a real restore, we'd need a backup ID. 
    // Using a dummy ID for this implementation.
    const result = await triggerRestore("backup-latest");
    if (!result.success) {
      toast.error(result.error);
      setRestoreInProgress(false);
      return;
    }

    const interval = setInterval(() => {
      setProgress(prev => {
        if (prev >= 100) {
          clearInterval(interval);
          setRestoreInProgress(false);
          toast.success("System restored successfully");
          return 100;
        }
        return prev + 5;
      });
    }, 300);
  };

  return (
    <div className="space-y-6">
      {/* Backup Status */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card className="border-l-4 border-l-emerald-500 shadow-sm">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs text-slate-500 dark:text-slate-400">Last Backup</p>
                <p className="text-lg font-semibold text-slate-900 dark:text-white">2 hours ago</p>
              </div>
              <CheckCircle className="h-5 w-5 text-emerald-500" />
            </div>
          </CardContent>
        </Card>
        <Card className="border-l-4 border-l-blue-500 shadow-sm">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs text-slate-500 dark:text-slate-400">Total Backups</p>
                <p className="text-lg font-semibold text-slate-900 dark:text-white">12</p>
              </div>
              <Database className="h-5 w-5 text-blue-500" />
            </div>
          </CardContent>
        </Card>
        <Card className="border-l-4 border-l-purple-500 shadow-sm">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs text-slate-500 dark:text-slate-400">Storage Used</p>
                <p className="text-lg font-semibold text-slate-900 dark:text-white">15.2 GB</p>
              </div>
              <HardDrive className="h-5 w-5 text-purple-500" />
            </div>
          </CardContent>
        </Card>
        <Card className="border-l-4 border-l-amber-500 shadow-sm">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs text-slate-500 dark:text-slate-400">Next Scheduled</p>
                <p className="text-lg font-semibold text-slate-900 dark:text-white">Tomorrow</p>
              </div>
              <Clock className="h-5 w-5 text-amber-500" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Quick Actions */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card className="shadow-sm">
          <CardHeader className="pb-4 border-b bg-slate-50/50 dark:bg-slate-900/50">
            <CardTitle className="text-base flex items-center gap-2">
              <Download className="h-4 w-4 text-blue-500" />
              Create Backup
            </CardTitle>
          </CardHeader>
          <CardContent className="p-4 space-y-4">
            {backupInProgress ? (
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-slate-600 dark:text-slate-400">Creating backup...</span>
                  <span className="text-sm font-medium">{progress}%</span>
                </div>
                <Progress value={progress} className="h-2" />
              </div>
            ) : (
              <>
                <p className="text-sm text-slate-600 dark:text-slate-400">
                  Create a full backup of your database including all student records, 
                  attendance, payments, and settings.
                </p>
                <Button onClick={startBackup} className="w-full rounded-md bg-blue-600">
                  <Database className="h-4 w-4 mr-2" />
                  Start Backup
                </Button>
              </>
            )}
          </CardContent>
        </Card>

        <Card className="shadow-sm">
          <CardHeader className="pb-4 border-b bg-slate-50/50 dark:bg-slate-900/50">
            <CardTitle className="text-base flex items-center gap-2">
              <Upload className="h-4 w-4 text-amber-500" />
              Restore Backup
            </CardTitle>
          </CardHeader>
          <CardContent className="p-4 space-y-4">
            {restoreInProgress ? (
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-slate-600 dark:text-slate-400">Restoring backup...</span>
                  <span className="text-sm font-medium">{progress}%</span>
                </div>
                <Progress value={progress} className="h-2" />
              </div>
            ) : (
              <>
                <p className="text-sm text-slate-600 dark:text-slate-400">
                  Restore from a previous backup. Warning: This will replace all 
                  current data with the backup data.
                </p>
                <Button onClick={startRestore} variant="outline" className="w-full rounded-md">
                  <RefreshCw className="h-4 w-4 mr-2" />
                  Restore from Backup
                </Button>
              </>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Backup Schedule */}
      <Card className="shadow-sm">
        <CardHeader className="pb-4 border-b bg-slate-50/50 dark:bg-slate-900/50">
          <CardTitle className="text-base flex items-center gap-2">
            <Clock className="h-4 w-4 text-slate-500 dark:text-slate-400" />
            Backup Schedule
          </CardTitle>
        </CardHeader>
        <CardContent className="p-4">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {SCHEDULE_OPTIONS.map(option => (
              <div key={option.id} className="p-4 border rounded-lg hover:bg-slate-50 dark:hover:bg-slate-900 cursor-pointer">
                <p className="font-medium text-slate-900 dark:text-white">{option.name}</p>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">{option.description}</p>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Backup History */}
      <Card className="shadow-sm">
        <CardHeader className="pb-4 border-b bg-slate-50/50 dark:bg-slate-900/50">
          <div className="flex items-center justify-between">
            <CardTitle className="text-base flex items-center gap-2">
              <Shield className="h-4 w-4 text-slate-500 dark:text-slate-400" />
              Backup History
            </CardTitle>
            <Badge className="bg-emerald-100 text-emerald-700">Auto-backup enabled</Badge>
          </div>
        </CardHeader>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-slate-50 dark:bg-slate-950 border-b">
                <tr>
                  <th className="px-4 py-3 text-left text-xs font-medium text-slate-500 dark:text-slate-400 uppercase">Backup Name</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-slate-500 dark:text-slate-400 uppercase">Type</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-slate-500 dark:text-slate-400 uppercase">Size</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-slate-500 dark:text-slate-400 uppercase">Created</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-slate-500 dark:text-slate-400 uppercase">Location</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-slate-500 dark:text-slate-400 uppercase">Status</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-slate-500 dark:text-slate-400 uppercase">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                {BACKUPS.map(backup => (
                  <tr key={backup.id} className="hover:bg-slate-50 dark:hover:bg-slate-900">
                    <td className="px-4 py-3">
                      <p className="text-sm font-medium text-slate-900 dark:text-white">{backup.name}</p>
                    </td>
                    <td className="px-4 py-3">
                      <Badge variant="outline" className="capitalize">{backup.type}</Badge>
                    </td>
                    <td className="px-4 py-3">
                      <span className="text-sm text-slate-600 dark:text-slate-400">{backup.size}</span>
                    </td>
                    <td className="px-4 py-3">
                      <span className="text-sm text-slate-500 dark:text-slate-400">{backup.created_at}</span>
                    </td>
                    <td className="px-4 py-3">
                      <Badge className={backup.location === "cloud" ? "bg-blue-100 text-blue-700" : "bg-purple-100 text-purple-700"}>
                        {backup.location}
                      </Badge>
                    </td>
                    <td className="px-4 py-3">
                      {backup.status === "completed" ? (
                        <span className="flex items-center gap-1 text-sm text-emerald-600">
                          <CheckCircle className="h-4 w-4" /> Completed
                        </span>
                      ) : backup.status === "failed" ? (
                        <span className="flex items-center gap-1 text-sm text-red-600">
                          <AlertCircle className="h-4 w-4" /> Failed
                        </span>
                      ) : (
                        <span className="flex items-center gap-1 text-sm text-amber-600">
                          <RefreshCw className="h-4 w-4 animate-spin" /> In Progress
                        </span>
                      )}
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-1">
                        <Button variant="ghost" size="icon" className="h-8 w-8">
                          <Download className="h-4 w-4" />
                        </Button>
                        <Button variant="ghost" size="icon" className="h-8 w-8 text-red-500">
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}