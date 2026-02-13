
import React, { useRef, useState } from 'react';
import { Download, Upload, AlertCircle, Database, FileJson, ShieldCheck, Link2, Key, ToggleLeft, ToggleRight, CheckCircle2, RefreshCw } from 'lucide-react';
import { AppData, CloudConfig } from '../types';

interface BackupManagerProps {
  data: AppData;
  onRestore: (data: AppData) => void;
  onUpdateCloudConfig?: (config: CloudConfig) => void;
}

const BackupManager: React.FC<BackupManagerProps> = ({ data, onRestore, onUpdateCloudConfig }) => {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [dbUrl, setDbUrl] = useState(data.cloudConfig?.dbUrl || '');
  const [apiKey, setApiKey] = useState(data.cloudConfig?.apiKey || '');
  const [isEnabled, setIsEnabled] = useState(data.cloudConfig?.isEnabled || false);
  const [testStatus, setTestStatus] = useState<'IDLE' | 'LOADING' | 'SUCCESS' | 'ERROR'>('IDLE');

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

  const handleSaveCloudConfig = () => {
    if (onUpdateCloudConfig) {
      onUpdateCloudConfig({ dbUrl, apiKey, isEnabled });
      alert("클라우드 설정이 저장되었습니다.");
    }
  };

  const handleTestConnection = async () => {
    if (!dbUrl) return alert("데이터베이스 URL을 입력해주세요.");
    setTestStatus('LOADING');
    try {
      const response = await fetch(dbUrl, {
        method: 'GET',
        headers: { 
          'Authorization': `Bearer ${apiKey}`,
          'x-api-key': apiKey,
          'Content-Type': 'application/json' 
        }
      });
      if (response.ok) {
        setTestStatus('SUCCESS');
        setTimeout(() => setTestStatus('IDLE'), 3000);
      } else {
        setTestStatus('ERROR');
      }
    } catch (e) {
      setTestStatus('ERROR');
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500 pb-12">
      <header>
        <h2 className="text-2xl font-bold text-slate-800">데이터 관리</h2>
        <p className="text-slate-500">클라우드 동기화 설정을 하거나 파일로 백업하세요.</p>
      </header>

      {/* Cloud Configuration Section */}
      <section className="bg-white p-8 rounded-[2.5rem] shadow-sm border border-slate-100 space-y-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="p-2 bg-indigo-50 text-indigo-600 rounded-xl">
              <Database className="w-5 h-5" />
            </div>
            <h3 className="text-lg font-bold text-slate-800">클라우드 동기화 설정</h3>
          </div>
          <button 
            onClick={() => setIsEnabled(!isEnabled)}
            className="flex items-center space-x-2"
          >
            <span className={`text-sm font-bold ${isEnabled ? 'text-indigo-600' : 'text-slate-400'}`}>
              {isEnabled ? '활성화됨' : '비활성'}
            </span>
            {isEnabled ? <ToggleRight className="w-8 h-8 text-indigo-600" /> : <ToggleLeft className="w-8 h-8 text-slate-300" />}
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <label className="text-xs font-bold text-slate-500 uppercase ml-1">Database API URL</label>
            <div className="relative">
              <Link2 className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
              <input
                type="text"
                value={dbUrl}
                onChange={(e) => setDbUrl(e.target.value)}
                placeholder="https://api.example.com/bin"
                className="w-full p-4 pl-12 bg-slate-50 border border-slate-200 rounded-2xl outline-none focus:ring-2 focus:ring-indigo-500 text-sm"
              />
            </div>
          </div>
          <div className="space-y-2">
            <label className="text-xs font-bold text-slate-500 uppercase ml-1">API Key / Token</label>
            <div className="relative">
              <Key className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
              <input
                type="password"
                value={apiKey}
                onChange={(e) => setApiKey(e.target.value)}
                placeholder="secret-key"
                className="w-full p-4 pl-12 bg-slate-50 border border-slate-200 rounded-2xl outline-none focus:ring-2 focus:ring-indigo-500 text-sm"
              />
            </div>
          </div>
        </div>

        <div className="flex gap-3 pt-2">
          <button
            onClick={handleSaveCloudConfig}
            className="flex-1 py-4 bg-indigo-600 hover:bg-indigo-700 text-white font-bold rounded-2xl transition-all shadow-lg shadow-indigo-100"
          >
            설정 저장하기
          </button>
          <button
            onClick={handleTestConnection}
            disabled={testStatus === 'LOADING'}
            className={`px-8 py-4 font-bold rounded-2xl border flex items-center justify-center min-w-[140px] transition-all ${
              testStatus === 'SUCCESS' ? 'bg-emerald-50 text-emerald-600 border-emerald-100' :
              testStatus === 'ERROR' ? 'bg-rose-50 text-rose-600 border-rose-100' :
              'bg-white text-slate-600 border-slate-200 hover:bg-slate-50'
            }`}
          >
            {testStatus === 'LOADING' ? <RefreshCw className="w-5 h-5 animate-spin" /> : 
             testStatus === 'SUCCESS' ? <CheckCircle2 className="w-5 h-5" /> : 
             testStatus === 'ERROR' ? <AlertCircle className="w-5 h-5" /> : "연결 테스트"}
          </button>
        </div>
      </section>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {/* Export Card */}
        <div className="bg-white p-8 rounded-3xl shadow-sm border border-slate-100 flex flex-col items-center text-center group hover:border-indigo-200 transition-all">
          <div className="p-4 bg-indigo-50 text-indigo-600 rounded-2xl mb-4 group-hover:scale-110 transition-transform">
            <Download className="w-7 h-7" />
          </div>
          <h4 className="font-bold text-slate-800 mb-2">파일 내보내기</h4>
          <p className="text-slate-400 text-xs mb-6 px-4 leading-relaxed">
            현재까지의 모든 기록을 JSON 파일로 오프라인 백업합니다.
          </p>
          <button
            onClick={handleBackup}
            className="w-full py-4 bg-slate-50 hover:bg-indigo-600 hover:text-white text-indigo-600 font-bold rounded-2xl transition-all border border-indigo-50"
          >
            백업 다운로드
          </button>
        </div>

        {/* Import Card */}
        <div className="bg-white p-8 rounded-3xl shadow-sm border border-slate-100 flex flex-col items-center text-center group hover:border-emerald-200 transition-all">
          <div className="p-4 bg-emerald-50 text-emerald-600 rounded-2xl mb-4 group-hover:scale-110 transition-transform">
            <Upload className="w-7 h-7" />
          </div>
          <h4 className="font-bold text-slate-800 mb-2">파일 가져오기</h4>
          <p className="text-slate-400 text-xs mb-6 px-4 leading-relaxed">
            백업해둔 JSON 파일을 업로드하여 데이터를 완전히 복구합니다.
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
            파일 불러오기
          </button>
        </div>
      </div>

      <div className="bg-rose-50 border border-rose-100 p-6 rounded-3xl flex items-start space-x-4">
        <AlertCircle className="w-6 h-6 text-rose-500 shrink-0" />
        <div>
          <h4 className="text-rose-800 font-bold text-sm mb-1">주의사항</h4>
          <p className="text-rose-600/80 text-xs leading-relaxed">
            클라우드 동기화 활성 시 모든 변경사항은 즉시 URL로 전송됩니다. 
            개인적인 API 서버나 JSONBin 같은 서비스를 이용할 때 URL과 키 노출에 주의하세요.
          </p>
        </div>
      </div>
    </div>
  );
};

export default BackupManager;
