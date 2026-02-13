
import React, { useRef } from 'react';
import { Download, Upload, AlertCircle, Database, FileJson, ShieldCheck } from 'lucide-react';
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
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500 pb-12">
      <header>
        <h2 className="text-2xl font-bold text-slate-800">데이터 관리</h2>
        <p className="text-slate-500">브라우저 로컬 데이터를 관리하거나 JSON 파일로 수동 백업하세요.</p>
      </header>

      {/* Local Info Card */}
      <div className="bg-gradient-to-br from-indigo-600 to-indigo-800 p-8 rounded-[2.5rem] text-white shadow-xl shadow-indigo-100 overflow-hidden relative">
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-4">
            <div className="flex items-center space-x-3">
              <div className="p-2 bg-white/10 rounded-xl backdrop-blur-md">
                <ShieldCheck className="w-6 h-6 text-white" />
              </div>
              <h3 className="text-xl font-bold">내 기기 내 안전 보관</h3>
            </div>
            <p className="text-indigo-100 text-sm max-w-md leading-relaxed">
              현재 모든 데이터는 외부 서버로 전송되지 않고 사용자의 브라우저 내부에만 안전하게 저장됩니다. 
              로그인이 필요 없으며 가장 사적인 가계부 관리가 가능합니다.
            </p>
            <div className="flex items-center space-x-4 text-xs font-medium bg-black/20 w-fit px-4 py-2 rounded-full">
              <span className="flex items-center"><Database className="w-3.5 h-3.5 mr-1.5 text-indigo-300" />로컬 전용</span>
              <span className="flex items-center"><FileJson className="w-3.5 h-3.5 mr-1.5 text-indigo-300" />기록: {data.transactions.length}건</span>
            </div>
          </div>
          <div className="p-6 bg-white/10 rounded-3xl backdrop-blur-sm border border-white/5 text-center min-w-[140px]">
            <span className="block text-3xl font-black mb-1">JSON</span>
            <span className="text-[10px] uppercase font-bold tracking-widest text-indigo-200">Local Mode</span>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {/* Export Card */}
        <div className="bg-white p-8 rounded-3xl shadow-sm border border-slate-100 flex flex-col items-center text-center group hover:border-indigo-200 transition-all">
          <div className="p-4 bg-indigo-50 text-indigo-600 rounded-2xl mb-4 group-hover:scale-110 transition-transform">
            <Download className="w-7 h-7" />
          </div>
          <h4 className="font-bold text-slate-800 mb-2">백업 파일 내보내기</h4>
          <p className="text-slate-400 text-xs mb-6 px-4 leading-relaxed">
            지금까지의 모든 내역을 JSON 파일로 변환하여 다운로드합니다. 정기적으로 백업하는 것을 권장합니다.
          </p>
          <button
            onClick={handleBackup}
            className="w-full py-4 bg-slate-50 hover:bg-indigo-600 hover:text-white text-indigo-600 font-bold rounded-2xl transition-all border border-indigo-50"
          >
            백업 파일 다운로드
          </button>
        </div>

        {/* Import Card */}
        <div className="bg-white p-8 rounded-3xl shadow-sm border border-slate-100 flex flex-col items-center text-center group hover:border-emerald-200 transition-all">
          <div className="p-4 bg-emerald-50 text-emerald-600 rounded-2xl mb-4 group-hover:scale-110 transition-transform">
            <Upload className="w-7 h-7" />
          </div>
          <h4 className="font-bold text-slate-800 mb-2">데이터 파일 불러오기</h4>
          <p className="text-slate-400 text-xs mb-6 px-4 leading-relaxed">
            백업해둔 JSON 파일을 업로드하여 데이터를 복구합니다. 현재 기록은 모두 교체됩니다.
          </p>
          <input
            type="file"
            ref={fileInputRef}
            onChange={handleRestore}
            className="hidden"
            accept=".json"
          />
          <button
            onClick={() => fileInputRef.current?.click()}
            className="w-full py-4 bg-slate-50 hover:bg-emerald-600 hover:text-white text-emerald-600 font-bold rounded-2xl transition-all border border-emerald-50"
          >
            데이터 복구하기
          </button>
        </div>
      </div>

      <div className="bg-rose-50 border border-rose-100 p-6 rounded-3xl flex items-start space-x-4">
        <AlertCircle className="w-6 h-6 text-rose-500 shrink-0" />
        <div>
          <h4 className="text-rose-800 font-bold text-sm mb-1">주의사항</h4>
          <p className="text-rose-600/80 text-xs leading-relaxed">
            브라우저 캐시를 삭제하거나 시크릿 모드를 종료하면 로컬 데이터가 삭제될 수 있습니다. 
            중요한 기록은 반드시 '백업 파일 내보내기'를 통해 안전한 곳에 별도로 저장해주세요.
          </p>
        </div>
      </div>
    </div>
  );
};

export default BackupManager;
