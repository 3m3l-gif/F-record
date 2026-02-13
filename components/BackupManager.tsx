
import React, { useRef, useState, useEffect } from 'react';
import { Download, Upload, AlertCircle, CloudCheck, RefreshCw, Database, ShieldCheck, Link2, Key, ToggleLeft, ToggleRight, CheckCircle2 } from 'lucide-react';
import { AppData, CloudConfig } from '../types';

interface BackupManagerProps {
  data: AppData;
  onRestore: (data: AppData) => void;
  onUpdateCloudConfig: (config: CloudConfig) => void;
}

const BackupManager: React.FC<BackupManagerProps> = ({ data, onRestore, onUpdateCloudConfig }) => {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [lastSync, setLastSync] = useState<string>(new Date().toLocaleTimeString());
  const [dbUrl, setDbUrl] = useState(data.cloudConfig?.dbUrl || '');
  const [apiKey, setApiKey] = useState(data.cloudConfig?.apiKey || '');
  const [isEnabled, setIsEnabled] = useState(data.cloudConfig?.isEnabled || false);
  const [testStatus, setTestStatus] = useState<'IDLE' | 'LOADING' | 'SUCCESS' | 'ERROR'>('IDLE');

  useEffect(() => {
    setLastSync(new Date().toLocaleTimeString());
  }, [data]);

  const handleSaveConfig = () => {
    onUpdateCloudConfig({ dbUrl, apiKey, isEnabled });
    alert("설정이 저장되었습니다. 이제 데이터가 해당 위치로 자동 동기화됩니다.");
  };

  const handleTestConnection = async () => {
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
        <h2 className="text-2xl font-bold text-slate-800">데이터 및 클라우드</h2>
        <p className="text-slate-500">데이터를 외부 데이터베이스와 연동하거나 수동으로 백업하세요.</p>
      </header>

      {/* Cloud Auto-Sync Status Card */}
      <div className="bg-gradient-to-br from-indigo-600 to-indigo-700 p-8 rounded-[2rem] text-white shadow-xl shadow-indigo-100 overflow-hidden relative">
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-4">
            <div className="flex items-center space-x-3">
              <div className="p-2 bg-white/20 rounded-xl backdrop-blur-md">
                <CloudCheck className="w-6 h-6 text-white" />
              </div>
              <h3 className="text-xl font-bold">실시간 동기화 현황</h3>
            </div>
            <p className="text-indigo-100 text-sm max-w-md leading-relaxed">
              {isEnabled && dbUrl 
                ? `현재 커스텀 데이터베이스(${new URL(dbUrl).hostname})와 실시간으로 동기화되고 있습니다.`
                : "현재 브라우저 로컬 저장소에 안전하게 자동 저장되고 있습니다."}
            </p>
            <div className="flex items-center space-x-4 text-xs font-medium bg-black/10 w-fit px-4 py-2 rounded-full">
              <span className="flex items-center"><ShieldCheck className="w-3.5 h-3.5 mr-1.5 text-emerald-300" />보안 연결됨</span>
              <span className="flex items-center"><RefreshCw className="w-3.5 h-3.5 mr-1.5 text-indigo-300" />마지막 동기화: {lastSync}</span>
            </div>
          </div>
          <Database className="absolute -right-10 -bottom-10 w-64 h-64 text-white/5 pointer-events-none" />
        </div>
      </div>

      {/* Database Connection Settings */}
      <section className="bg-white p-8 rounded-[2rem] shadow-sm border border-slate-100 space-y-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="p-2 bg-slate-50 text-indigo-600 rounded-xl">
              <Link2 className="w-5 h-5" />
            </div>
            <h3 className="text-lg font-bold text-slate-800">나만의 데이터베이스 연결</h3>
          </div>
          <button 
            onClick={() => setIsEnabled(!isEnabled)}
            className="flex items-center space-x-2 text-sm font-bold"
          >
            <span className={isEnabled ? 'text-indigo-600' : 'text-slate-400'}>
              {isEnabled ? '클라우드 활성화됨' : '비활성 (로컬 모드)'}
            </span>
            {isEnabled ? <ToggleRight className="w-8 h-8 text-indigo-600" /> : <ToggleLeft className="w-8 h-8 text-slate-300" />}
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <label className="text-xs font-bold text-slate-500 uppercase ml-1">데이터베이스 API URL</label>
            <div className="relative">
              <input
                type="text"
                placeholder="https://api.example.com/data"
                value={dbUrl}
                onChange={(e) => setDbUrl(e.target.value)}
                className="w-full p-4 bg-slate-50 border border-slate-200 rounded-2xl outline-none focus:ring-2 focus:ring-indigo-500 transition-all text-sm"
              />
            </div>
          </div>
          <div className="space-y-2">
            <label className="text-xs font-bold text-slate-500 uppercase ml-1">API Key / Token</label>
            <div className="relative">
              <Key className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
              <input
                type="password"
                placeholder="••••••••••••••••"
                value={apiKey}
                onChange={(e) => setApiKey(e.target.value)}
                className="w-full p-4 pl-12 bg-slate-50 border border-slate-200 rounded-2xl outline-none focus:ring-2 focus:ring-indigo-500 transition-all text-sm"
              />
            </div>
          </div>
        </div>

        <div className="flex gap-3">
          <button
            onClick={handleSaveConfig}
            className="flex-1 py-4 bg-indigo-600 hover:bg-indigo-700 text-white font-bold rounded-2xl transition-all shadow-lg shadow-indigo-100"
          >
            설정 저장 및 연결
          </button>
          <button
            onClick={handleTestConnection}
            disabled={testStatus === 'LOADING'}
            className={`px-8 py-4 font-bold rounded-2xl transition-all border flex items-center justify-center min-w-[140px] ${
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
        <div className="bg-white p-6 rounded-3xl shadow-sm border border-slate-100 flex flex-col items-center text-center group hover:border-indigo-200 transition-all">
          <div className="p-4 bg-indigo-50 text-indigo-600 rounded-2xl mb-4 group-hover:scale-110 transition-transform">
            <Download className="w-6 h-6" />
          </div>
          <h4 className="font-bold text-slate-800 mb-2">파일 내보내기</h4>
          <p className="text-slate-400 text-xs mb-6 px-4 leading-relaxed">
            현재 모든 기록을 JSON 파일로 변환하여 PC/모바일에 오프라인 백업본을 다운로드합니다.
          </p>
          <button
            onClick={handleBackup}
            className="w-full py-3 bg-slate-50 hover:bg-indigo-600 hover:text-white text-indigo-600 font-bold rounded-xl transition-all border border-indigo-50"
          >
            백업 다운로드
          </button>
        </div>

        {/* Import Card */}
        <div className="bg-white p-6 rounded-3xl shadow-sm border border-slate-100 flex flex-col items-center text-center group hover:border-emerald-200 transition-all">
          <div className="p-4 bg-emerald-50 text-emerald-600 rounded-2xl mb-4 group-hover:scale-110 transition-transform">
            <Upload className="w-6 h-6" />
          </div>
          <h4 className="font-bold text-slate-800 mb-2">파일 가져오기</h4>
          <p className="text-slate-400 text-xs mb-6 px-4 leading-relaxed">
            이전에 백업한 JSON 파일을 업로드하여 데이터를 복구합니다. (현재 데이터가 덮어씌워짐)
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
            className="w-full py-3 bg-slate-50 hover:bg-emerald-600 hover:text-white text-emerald-600 font-bold rounded-xl transition-all border border-emerald-50"
          >
            파일 선택하기
          </button>
        </div>
      </div>

      {/* Warning Card */}
      <div className="bg-rose-50 border border-rose-100 p-6 rounded-3xl flex items-start space-x-4">
        <AlertCircle className="w-6 h-6 text-rose-500 shrink-0" />
        <div>
          <h4 className="text-rose-800 font-bold text-sm mb-1">데이터 복구 주의사항</h4>
          <p className="text-rose-600/80 text-xs leading-relaxed">
            파일을 가져오면 현재 브라우저 및 연동된 클라우드에 저장된 모든 데이터가 백업 파일의 내용으로 완전히 교체됩니다. 
            교체된 데이터는 되돌릴 수 없으니 주의해 주세요.
          </p>
        </div>
      </div>
    </div>
  );
};

export default BackupManager;
