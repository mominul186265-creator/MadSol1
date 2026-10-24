import React, { Component, ErrorInfo, ReactNode } from 'react';

interface Props {
  children: ReactNode;
}

interface State {
  hasError: boolean;
  error?: Error;
}

export class ErrorBoundary extends Component<Props, State> {
  declare props: Props;

  constructor(props: Props) {
    super(props);
  }

  public state: State = {
    hasError: false,
  };

  public static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('MadSol Uncaught UI Error:', error, errorInfo);
  }

  private handleReload = () => {
    try {
      window.location.reload();
    } catch {
      window.location.href = '/';
    }
  };

  private handleReset = () => {
    try {
      localStorage.clear();
      sessionStorage.clear();
    } catch {}
    this.handleReload();
  };

  public render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen bg-slate-900 text-white flex flex-col items-center justify-center p-6 text-center select-none">
          <div className="w-16 h-16 rounded-2xl bg-emerald-700/50 flex items-center justify-center mb-5 border border-emerald-500/30 shadow-lg">
            <img src="/MadSol_App_Icon_.png" alt="MadSol" className="w-12 h-12 rounded-xl" />
          </div>
          <h2 className="text-xl font-bold text-white mb-2 font-bangla">মাদসোল রিলোড করুন</h2>
          <p className="text-slate-300 text-sm max-w-sm mb-6 leading-relaxed font-bangla">
            অ্যাপ্লিকেশনে সাময়িক সমস্যা হয়েছে। অনুগ্রহ করে পেজটি পুনরায় লোড করুন।
          </p>
          <div className="flex gap-3">
            <button
              onClick={this.handleReload}
              className="px-5 py-2.5 bg-emerald-600 hover:bg-emerald-500 active:scale-95 text-white font-medium rounded-xl shadow-md transition-all text-sm font-bangla"
            >
              🔄 রিলোড করুন
            </button>
            <button
              onClick={this.handleReset}
              className="px-4 py-2.5 bg-slate-800 hover:bg-slate-700 active:scale-95 text-slate-300 text-sm rounded-xl border border-slate-700 transition-all font-bangla"
            >
              ক্যাশ মুছে রিলোড
            </button>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}
