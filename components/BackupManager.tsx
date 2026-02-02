
import React, { useRef } from 'react';
import { Download, Upload, AlertCircle } from 'lucide-react';
import { AppData } from '../types';

interface BackupManagerProps {
  data: AppData;
  onRestore: (data: AppData) => void;
}

const BackupManager: React.FC<BackupManagerProps> = ({ data, onRestore }) => {
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleBackup = () => {
    const jsonString = JSON.stringify(data, null, 2);
    const blob = new Blob([jsonString], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `smart_ledger_backup_${new Date().toISOString().split('T')[0]}.json`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  const handleRestore = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const json = JSON.parse(event.target?.result as string);
        // Simple validation
        if (json.accounts && json.categories && json.transactions) {
          if (confirm("기존 데이터가 백업 파일의 데이터로 대체됩니다. 계속하시겠습니까?")) {
            onRestore(json);
            alert("복구가 완료되었습니다.");
          }
        } else {
          alert("유효한 백업 파일이 아닙니다.");
        }
      } catch (err) {
        alert("파일을 읽는 중 오류가 발생했습니다.");
      }
    };
    reader.readAsText(file);
    // Reset input
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  return (
    <div className="max-w-4xl mx-auto space-y-8">
      <header>
        <h2 className="text-2xl font-bold text-slate-800">백업 및 복구</h2>
        <p className="text-slate-500">데이터를 안전하게 보관하고 불러오세요.</p>
      </header>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-white p-8 rounded-3xl shadow-sm border border-slate-100 flex flex-col items-center text-center space-y-4">
          <div className="p-4 bg-indigo-50 text-indigo-600 rounded-full">
            <Download className="w-8 h-8" />
          </div>
          <h3 className="text-xl font-bold">파일로 내보내기</h3>
          <p className="text-slate-500 text-sm">
            현재 모든 기록과 설정을 JSON 파일 형태로 PC에 저장합니다. 정기적인 백업을 권장합니다.
          </p>
          <button
            onClick={handleBackup}
            className="w-full mt-4 p-4 bg-indigo-600 hover:bg-indigo-700 text-white font-bold rounded-2xl transition-colors"
          >
            백업 파일 다운로드
          </button>
        </div>

        <div className="bg-white p-8 rounded-3xl shadow-sm border border-slate-100 flex flex-col items-center text-center space-y-4">
          <div className="p-4 bg-amber-50 text-amber-600 rounded-full">
            <Upload className="w-8 h-8" />
          </div>
          <h3 className="text-xl font-bold">파일에서 가져오기</h3>
          <p className="text-slate-500 text-sm">
            기존에 백업한 파일을 업로드하여 데이터를 복구합니다. 현재 브라우저의 데이터는 삭제되니 주의하세요.
          </p>
          <input
            type="file"
            ref={fileInputRef}
            onChange={handleRestore}
            accept=".json"
            className="hidden"
          />
          <button
            onClick={() => fileInputRef.current?.click()}
            className="w-full mt-4 p-4 bg-amber-500 hover:bg-amber-600 text-white font-bold rounded-2xl transition-colors"
          >
            백업 파일 불러오기
          </button>
        </div>
      </div>

      <div className="bg-slate-900 p-6 rounded-3xl text-white flex items-start space-x-4">
        <AlertCircle className="w-6 h-6 text-amber-400 shrink-0" />
        <div className="text-sm space-y-2">
          <p className="font-bold text-amber-400">주의사항</p>
          <p className="text-slate-400 leading-relaxed">
            Smart Ledger Pro는 사용자의 데이터를 서버에 저장하지 않습니다. 브라우저 캐시를 삭제하거나 시크릿 모드를 사용할 경우 데이터가 유실될 수 있으므로, 수시로 '파일로 내보내기'를 통해 백업 파일을 보관하시기 바랍니다.
          </p>
        </div>
      </div>
    </div>
  );
};

export default BackupManager;
