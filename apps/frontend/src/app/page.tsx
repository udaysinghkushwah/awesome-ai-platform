'use client';

import React, { useState, useEffect } from 'react';

const API_BASE = 'http://localhost:4000';

export default function Home() {
  const [activeTab, setActiveTab] = useState('auth');
  const [token, setToken] = useState('');
  const [orgId, setOrgId] = useState('');
  const [projectId, setProjectId] = useState('');

  // Register & Login State
  const [email, setEmail] = useState('john.doe@example.com');
  const [password, setPassword] = useState('securepassword123');
  const [name, setName] = useState('John Doe');
  const [authStatus, setAuthStatus] = useState('Not Logged In');
  const [userProfile, setUserProfile] = useState<any>(null);

  // Search State
  const [searchQuery, setSearchQuery] = useState('factorial');
  const [searchResults, setSearchResults] = useState<any>(null);

  // Code Review State
  const [codeReviewLang, setCodeReviewLang] = useState('typescript');
  const [codeSnippet, setCodeSnippet] = useState(`import express from 'express';
const app = express();
const port = 3000;

app.get('/user', (req, res) => {
  const id = req.query.id;
  // Raw string concat is vulnerable to injection
  const query = \`SELECT * FROM users WHERE id = '\${id}'\`;
  db.query(query, (err, result) => {
    res.send(result);
  });
});`);
  const [reviewOutput, setReviewOutput] = useState<any>(null);

  // SQL State
  const [sqlQuery, setSqlQuery] = useState(`SELECT * FROM users WHERE status = 'PENDING' ORDER BY created_at DESC;`);
  const [sqlSchema, setSqlSchema] = useState(`CREATE TABLE users (id SERIAL PRIMARY KEY, status VARCHAR(20), created_at TIMESTAMP);`);
  const [sqlOutput, setSqlOutput] = useState<any>(null);

  // Agent State
  const [agentRequirement, setAgentRequirement] = useState('Create a secure User Login endpoint with standard Jest testing.');
  const [agentOutput, setAgentOutput] = useState<any>(null);

  // Plugins & Templates State
  const [plugins, setPlugins] = useState<any[]>([]);
  const [installedPlugins, setInstalledPlugins] = useState<any[]>([]);
  const [templates, setTemplates] = useState<any[]>([]);
  const [selectedTemplate, setSelectedTemplate] = useState<any>(null);

  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  // Get project if token is present
  useEffect(() => {
    if (token && orgId) {
      fetchProjects();
      fetchPlugins();
      fetchTemplates();
    }
  }, [token, orgId]);

  const handleRegister = async () => {
    setLoading(true);
    setErrorMsg('');
    try {
      const res = await fetch(`${API_BASE}/auth/register`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password, firstName: name.split(' ')[0], lastName: name.split(' ')[1] || '' })
      });
      const data = await res.json();
      if (res.ok) {
        setToken(data.token);
        setOrgId(data.user.organizationId);
        setAuthStatus('Registered & Logged In');
        setUserProfile(data.user);
      } else {
        setErrorMsg(data.message || 'Registration failed');
      }
    } catch (err: any) {
      setErrorMsg(err.message || 'Connection error');
    }
    setLoading(false);
  };

  const handleLogin = async () => {
    setLoading(true);
    setErrorMsg('');
    try {
      const res = await fetch(`${API_BASE}/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password })
      });
      const data = await res.json();
      if (res.ok) {
        setToken(data.token);
        setOrgId(data.user.organizationId);
        setAuthStatus('Logged In');
        setUserProfile(data.user);
      } else {
        setErrorMsg(data.message || 'Login failed');
      }
    } catch (err: any) {
      setErrorMsg(err.message || 'Connection error');
    }
    setLoading(false);
  };

  const fetchProjects = async () => {
    try {
      const res = await fetch(`${API_BASE}/orgs/${orgId}/projects`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const data = await res.json();
      if (res.ok && data.length > 0) {
        setProjectId(data[0].id);
      } else {
        // Create project
        const createRes = await fetch(`${API_BASE}/orgs/${orgId}/projects`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
          },
          body: JSON.stringify({ name: 'Default Workspace' })
        });
        const newProj = await createRes.json();
        if (createRes.ok) setProjectId(newProj.id);
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleSearch = async () => {
    setLoading(true);
    try {
      const res = await fetch(`${API_BASE}/orgs/${orgId}/projects/${projectId}/search?q=${searchQuery}`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const data = await res.json();
      setSearchResults(data);
    } catch (err) {
      console.error(err);
    }
    setLoading(false);
  };

  const handleCodeReview = async () => {
    setLoading(true);
    setReviewOutput(null);
    try {
      const res = await fetch(`${API_BASE}/orgs/${orgId}/projects/${projectId}/reviews/analyze`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ filename: 'review-file.ts', language: codeReviewLang, code: codeSnippet })
      });
      const data = await res.json();
      setReviewOutput(data);
    } catch (err) {
      console.error(err);
    }
    setLoading(false);
  };

  const handleSqlAnalysis = async () => {
    setLoading(true);
    setSqlOutput(null);
    try {
      const res = await fetch(`${API_BASE}/orgs/${orgId}/projects/${projectId}/reviews/sql`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ query: sqlQuery, schema: sqlSchema })
      });
      const data = await res.json();
      setSqlOutput(data);
    } catch (err) {
      console.error(err);
    }
    setLoading(false);
  };

  const handleAgentExecute = async () => {
    setLoading(true);
    setAgentOutput(null);
    try {
      const res = await fetch(`${API_BASE}/orgs/${orgId}/projects/${projectId}/agents/execute`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ requirement: agentRequirement })
      });
      const data = await res.json();
      setAgentOutput(data);
    } catch (err) {
      console.error(err);
    }
    setLoading(false);
  };

  const fetchPlugins = async () => {
    try {
      const res = await fetch(`${API_BASE}/plugins`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const data = await res.json();
      setPlugins(data);

      const installedRes = await fetch(`${API_BASE}/orgs/${orgId}/projects/${projectId}/plugins`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const installedData = await installedRes.json();
      setInstalledPlugins(installedData);
    } catch (err) {
      console.error(err);
    }
  };

  const installPlugin = async (pluginId: string) => {
    try {
      const res = await fetch(`${API_BASE}/orgs/${orgId}/projects/${projectId}/plugins/${pluginId}/install`, {
        method: 'POST',
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (res.ok) {
        fetchPlugins();
      }
    } catch (err) {
      console.error(err);
    }
  };

  const fetchTemplates = async () => {
    try {
      const res = await fetch(`${API_BASE}/templates`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const data = await res.json();
      setTemplates(data);
    } catch (err) {
      console.error(err);
    }
  };

  const loadTemplate = async (templateId: string) => {
    try {
      const res = await fetch(`${API_BASE}/templates/${templateId}`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const data = await res.json();
      setSelectedTemplate(data);
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div className="flex h-screen bg-slate-950 text-slate-100 font-sans">
      {/* Sidebar Navigation */}
      <aside className="w-80 border-r border-slate-800 bg-slate-900/60 backdrop-blur-md p-6 flex flex-col justify-between">
        <div>
          <div className="flex items-center gap-3 mb-8">
            <span className="text-2xl">🚀</span>
            <h1 className="text-xl font-bold tracking-tight bg-gradient-to-r from-teal-400 to-indigo-400 bg-clip-text text-transparent">
              Awesome AI Platform
            </h1>
          </div>
          <nav className="space-y-1.5">
            {[
              { id: 'auth', label: '🔐 Auth & Tenancy' },
              { id: 'search', label: '🔍 Semantic Search' },
              { id: 'review', label: '🕵️‍♂️ Code Review' },
              { id: 'sql', label: '📊 SQL Optimizer' },
              { id: 'agent', label: '🤖 Multi-Agent Mesh' },
              { id: 'marketplace', label: '🔌 Marketplace & Templates' }
            ].map(tab => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`w-full text-left px-4 py-3 rounded-lg text-sm font-medium transition-all duration-250 ${
                  activeTab === tab.id
                    ? 'bg-gradient-to-r from-teal-500/20 to-indigo-500/20 border border-teal-500/40 text-teal-300'
                    : 'text-slate-400 hover:bg-slate-800/50 hover:text-slate-200'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </nav>
        </div>
        <div className="p-4 rounded-xl bg-slate-950/40 border border-slate-800 text-xs text-slate-500">
          <p>Local Gateway: {API_BASE}</p>
          <p className="mt-1">Status: <span className={token ? 'text-teal-400' : 'text-amber-500'}>{authStatus}</span></p>
        </div>
      </aside>

      {/* Main Content Area */}
      <main className="flex-1 overflow-y-auto p-10 bg-slate-950/90 relative">
        {loading && (
          <div className="absolute inset-0 bg-slate-950/60 backdrop-blur-sm z-50 flex items-center justify-center">
            <div className="flex flex-col items-center gap-3">
              <div className="w-12 h-12 rounded-full border-4 border-teal-500 border-t-transparent animate-spin"></div>
              <p className="text-sm text-teal-400 font-medium">Processing request...</p>
            </div>
          </div>
        )}

        {/* Global Error Banner */}
        {errorMsg && (
          <div className="mb-6 p-4 rounded-xl border border-red-500/40 bg-red-950/20 text-red-300 text-sm">
            ⚠️ {errorMsg}
          </div>
        )}

        {/* Auth Page */}
        {activeTab === 'auth' && (
          <div className="max-w-2xl space-y-6">
            <h2 className="text-2xl font-bold">🔐 Authentication & Tenancy Onboarding</h2>
            <p className="text-slate-400 text-sm leading-relaxed">
              Register a profile to auto-provision an isolated Organization and Default Team database records.
            </p>
            <div className="p-6 rounded-2xl bg-slate-900/40 border border-slate-800 space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">Display Name</label>
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-lg px-4 py-3 text-slate-200 text-sm focus:outline-none focus:border-teal-500"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">Email Address</label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-lg px-4 py-3 text-slate-200 text-sm focus:outline-none focus:border-teal-500"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">Password</label>
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-lg px-4 py-3 text-slate-200 text-sm focus:outline-none focus:border-teal-500"
                />
              </div>
              <div className="flex gap-4 pt-2">
                <button
                  onClick={handleRegister}
                  className="px-6 py-3 rounded-lg bg-teal-500 hover:bg-teal-600 text-slate-950 text-sm font-semibold transition"
                >
                  Onboard & Onramp
                </button>
                <button
                  onClick={handleLogin}
                  className="px-6 py-3 rounded-lg border border-slate-800 hover:bg-slate-800 text-slate-200 text-sm font-semibold transition"
                >
                  Sign In
                </button>
              </div>
            </div>
            {userProfile && (
              <div className="p-6 rounded-2xl bg-slate-900/40 border border-slate-800 space-y-2">
                <h3 className="font-bold text-teal-400">Profile Context Active</h3>
                <pre className="text-xs text-slate-400 bg-slate-950/80 p-4 rounded-xl overflow-x-auto">
                  {JSON.stringify(userProfile, null, 2)}
                </pre>
              </div>
            )}
          </div>
        )}

        {/* Semantic Search */}
        {activeTab === 'search' && (
          <div className="max-w-3xl space-y-6">
            <h2 className="text-2xl font-bold">🔍 Semantic & Dense Vector search</h2>
            <p className="text-slate-400 text-sm leading-relaxed">
              Verify similarity indexes locally. Query is embedded to 1536-dims and matched against files using Cosine similarity.
            </p>
            {!token && <p className="text-amber-500 text-sm">⚠️ Please authenticate first using the Auth panel.</p>}
            {token && (
              <div className="space-y-6">
                <div className="flex gap-3">
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="Search keyword (e.g. factorial)..."
                    className="flex-1 bg-slate-950 border border-slate-800 rounded-lg px-4 py-3 text-slate-200 text-sm focus:outline-none focus:border-teal-500"
                  />
                  <button
                    onClick={handleSearch}
                    className="px-6 py-3 rounded-lg bg-teal-500 text-slate-950 text-sm font-semibold hover:bg-teal-600 transition"
                  >
                    Search
                  </button>
                </div>
                {searchResults && (
                  <div className="space-y-4">
                    <h3 className="font-bold text-teal-400">Search Results</h3>
                    {searchResults.results?.length === 0 ? (
                      <p className="text-slate-500 text-sm">No vector matches found. Register mock documents by run-tests.js first.</p>
                    ) : (
                      <pre className="text-xs text-slate-400 bg-slate-950/80 p-4 rounded-xl overflow-x-auto">
                        {JSON.stringify(searchResults, null, 2)}
                      </pre>
                    )}
                  </div>
                )}
              </div>
            )}
          </div>
        )}

        {/* Code Review */}
        {activeTab === 'review' && (
          <div className="max-w-4xl space-y-6">
            <h2 className="text-2xl font-bold">🕵️‍♂️ AI-Powered Code Review & Static Analysis</h2>
            <p className="text-slate-400 text-sm leading-relaxed">
              Perform structural reviews calculating LOC, complexity metrics, design smells, and security risks.
            </p>
            {!token && <p className="text-amber-500 text-sm">⚠️ Please authenticate first using the Auth panel.</p>}
            {token && (
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <div className="space-y-4">
                  <div className="flex justify-between items-center">
                    <label className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Paste Source Code</label>
                    <select
                      value={codeReviewLang}
                      onChange={(e) => setCodeReviewLang(e.target.value)}
                      className="bg-slate-900 border border-slate-800 text-xs rounded px-2 py-1 focus:outline-none"
                    >
                      <option value="typescript">TypeScript</option>
                      <option value="python">Python</option>
                      <option value="javascript">JavaScript</option>
                    </select>
                  </div>
                  <textarea
                    rows={12}
                    value={codeSnippet}
                    onChange={(e) => setCodeSnippet(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-800 rounded-lg p-4 font-mono text-xs text-slate-300 focus:outline-none focus:border-teal-500"
                  />
                  <button
                    onClick={handleCodeReview}
                    className="w-full py-3 rounded-lg bg-teal-500 text-slate-950 text-sm font-semibold hover:bg-teal-600 transition"
                  >
                    Analyze Source Code
                  </button>
                </div>
                <div className="space-y-4">
                  <label className="text-xs font-semibold text-slate-400 uppercase tracking-wider block">Scan Output</label>
                  {reviewOutput ? (
                    <div className="space-y-4">
                      <div className="grid grid-cols-2 gap-3">
                        <div className="p-4 rounded-xl bg-slate-900/60 border border-slate-800">
                          <p className="text-xs text-slate-500">Estimated Complexity</p>
                          <p className="text-xl font-bold text-teal-400">{reviewOutput.staticMetrics?.cyclomaticComplexity}</p>
                        </div>
                        <div className="p-4 rounded-xl bg-slate-900/60 border border-slate-800">
                          <p className="text-xs text-slate-500">Lines of Code</p>
                          <p className="text-xl font-bold text-teal-400">{reviewOutput.staticMetrics?.linesOfCode}</p>
                        </div>
                      </div>
                      <pre className="text-xs text-slate-400 bg-slate-950/80 p-4 rounded-xl overflow-x-auto max-h-[300px] overflow-y-auto">
                        {JSON.stringify(reviewOutput, null, 2)}
                      </pre>
                    </div>
                  ) : (
                    <div className="h-64 flex items-center justify-center border border-dashed border-slate-800 rounded-xl text-slate-600 text-xs">
                      No analysis executed yet.
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>
        )}

        {/* SQL Optimizer */}
        {activeTab === 'sql' && (
          <div className="max-w-4xl space-y-6">
            <h2 className="text-2xl font-bold">📊 SQL Query Performance Tuner</h2>
            <p className="text-slate-400 text-sm leading-relaxed">
              Submit query structures to scan table execution plans, index hints, and sequential scan bottlenecks.
            </p>
            {!token && <p className="text-amber-500 text-sm">⚠️ Please authenticate first using the Auth panel.</p>}
            {token && (
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <div className="space-y-4">
                  <div>
                    <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">SQL Schema Context (Optional)</label>
                    <textarea
                      rows={4}
                      value={sqlSchema}
                      onChange={(e) => setSqlSchema(e.target.value)}
                      className="w-full bg-slate-950 border border-slate-800 rounded-lg p-3 font-mono text-xs text-slate-300 focus:outline-none focus:border-teal-500"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">Raw SQL Query</label>
                    <textarea
                      rows={4}
                      value={sqlQuery}
                      onChange={(e) => setSqlQuery(e.target.value)}
                      className="w-full bg-slate-950 border border-slate-800 rounded-lg p-3 font-mono text-xs text-slate-300 focus:outline-none focus:border-teal-500"
                    />
                  </div>
                  <button
                    onClick={handleSqlAnalysis}
                    className="w-full py-3 rounded-lg bg-teal-500 text-slate-950 text-sm font-semibold hover:bg-teal-600 transition"
                  >
                    Analyze Query Plan
                  </button>
                </div>
                <div className="space-y-4">
                  <label className="text-xs font-semibold text-slate-400 uppercase tracking-wider block">Optimizer Recommendations</label>
                  {sqlOutput ? (
                    <div className="p-6 rounded-xl bg-slate-900/60 border border-slate-800 space-y-4">
                      <div>
                        <p className="text-xs text-slate-500 font-semibold uppercase mb-1">Table Scan Warnings</p>
                        <ul className="text-xs text-red-300 list-disc list-inside">
                          {sqlOutput.tableScans?.map((scan: string, i: number) => <li key={i}>{scan}</li>)}
                        </ul>
                      </div>
                      <div>
                        <p className="text-xs text-slate-500 font-semibold uppercase mb-1">Recommended Index Script</p>
                        <pre className="text-xs text-teal-300 bg-slate-950/80 p-3 rounded font-mono">
                          {sqlOutput.missingIndexes?.join('\n') || 'None'}
                        </pre>
                      </div>
                      <div>
                        <p className="text-xs text-slate-500 font-semibold uppercase mb-1">Optimized Rewrite</p>
                        <pre className="text-xs text-slate-300 bg-slate-950/80 p-3 rounded font-mono overflow-x-auto">
                          {sqlOutput.rewrittenQuery}
                        </pre>
                      </div>
                      <div>
                        <p className="text-xs text-slate-500 font-semibold uppercase mb-1">Explanation</p>
                        <p className="text-xs text-slate-400">{sqlOutput.explanation}</p>
                      </div>
                    </div>
                  ) : (
                    <div className="h-64 flex items-center justify-center border border-dashed border-slate-800 rounded-xl text-slate-600 text-xs">
                      No optimizer run executed yet.
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>
        )}

        {/* Multi Agent */}
        {activeTab === 'agent' && (
          <div className="max-w-4xl space-y-6">
            <h2 className="text-2xl font-bold">🤖 Collaborative Multi-Agent AI Chain</h2>
            <p className="text-slate-400 text-sm leading-relaxed">
              Trigger the sequential agent pipeline where the Architect designs specs, Developer generates logic, QA builds tests, and DevOps outputs deployments.
            </p>
            {!token && <p className="text-amber-500 text-sm">⚠️ Please authenticate first using the Auth panel.</p>}
            {token && (
              <div className="space-y-6">
                <div className="p-6 rounded-2xl bg-slate-900/40 border border-slate-800 space-y-4">
                  <div>
                    <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">Requirement Specifications</label>
                    <input
                      type="text"
                      value={agentRequirement}
                      onChange={(e) => setAgentRequirement(e.target.value)}
                      className="w-full bg-slate-950 border border-slate-800 rounded-lg px-4 py-3 text-slate-200 text-sm focus:outline-none focus:border-teal-500"
                    />
                  </div>
                  <button
                    onClick={handleAgentExecute}
                    className="px-6 py-3 rounded-lg bg-teal-500 text-slate-950 text-sm font-semibold hover:bg-teal-600 transition"
                  >
                    Trigger Collaborative Agent Mesh
                  </button>
                </div>
                {agentOutput && (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="p-5 rounded-xl bg-slate-900/60 border border-slate-800 space-y-2">
                      <h4 className="font-semibold text-teal-400 text-xs uppercase">📐 Architect Agent Output</h4>
                      <pre className="text-[10px] text-slate-400 bg-slate-950/80 p-3 rounded-lg overflow-auto h-48 font-mono">
                        {agentOutput.architect}
                      </pre>
                    </div>
                    <div className="p-5 rounded-xl bg-slate-900/60 border border-slate-800 space-y-2">
                      <h4 className="font-semibold text-teal-400 text-xs uppercase">💻 Developer Agent Output</h4>
                      <pre className="text-[10px] text-slate-400 bg-slate-950/80 p-3 rounded-lg overflow-auto h-48 font-mono">
                        {agentOutput.developer}
                      </pre>
                    </div>
                    <div className="p-5 rounded-xl bg-slate-900/60 border border-slate-800 space-y-2">
                      <h4 className="font-semibold text-teal-400 text-xs uppercase">🧪 Tester Agent Output</h4>
                      <pre className="text-[10px] text-slate-400 bg-slate-950/80 p-3 rounded-lg overflow-auto h-48 font-mono">
                        {agentOutput.tester}
                      </pre>
                    </div>
                    <div className="p-5 rounded-xl bg-slate-900/60 border border-slate-800 space-y-2">
                      <h4 className="font-semibold text-teal-400 text-xs uppercase">🐳 DevOps Agent Output</h4>
                      <pre className="text-[10px] text-slate-400 bg-slate-950/80 p-3 rounded-lg overflow-auto h-48 font-mono">
                        {agentOutput.devops}
                      </pre>
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
        )}

        {/* Marketplace & Templates */}
        {activeTab === 'marketplace' && (
          <div className="max-w-4xl space-y-6">
            <h2 className="text-2xl font-bold">🔌 Extension Marketplace & Community Templates</h2>
            <p className="text-slate-400 text-sm leading-relaxed">
              Explore reusable extension plugins and standard code templates inside the project workspace.
            </p>
            {!token && <p className="text-amber-500 text-sm">⚠️ Please authenticate first using the Auth panel.</p>}
            {token && (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                {/* Plugins */}
                <div className="space-y-4">
                  <h3 className="text-lg font-bold text-teal-400">Plugin Marketplace</h3>
                  <div className="space-y-3">
                    {plugins.map((plugin) => {
                      const isInstalled = installedPlugins.some(p => p.id === plugin.id);
                      return (
                        <div key={plugin.id} className="p-4 rounded-xl bg-slate-900/60 border border-slate-800 flex justify-between items-start">
                          <div>
                            <h4 className="font-semibold text-sm">{plugin.name}</h4>
                            <p className="text-xs text-slate-400 mt-1">{plugin.description}</p>
                            <div className="flex gap-2 mt-2">
                              <span className="text-[10px] text-slate-500">v{plugin.version}</span>
                              <span className="text-[10px] text-slate-500">•</span>
                              <span className="text-[10px] text-slate-500">By {plugin.author}</span>
                            </div>
                          </div>
                          <button
                            onClick={() => !isInstalled && installPlugin(plugin.id)}
                            disabled={isInstalled}
                            className={`px-3 py-1.5 rounded text-xs font-medium transition ${
                              isInstalled
                                ? 'bg-slate-800 text-slate-500 cursor-not-allowed'
                                : 'bg-teal-500 text-slate-950 hover:bg-teal-600'
                            }`}
                          >
                            {isInstalled ? 'Installed' : 'Install'}
                          </button>
                        </div>
                      );
                    })}
                  </div>
                </div>

                {/* Templates */}
                <div className="space-y-4">
                  <h3 className="text-lg font-bold text-teal-400">Community Templates</h3>
                  <div className="space-y-3">
                    {templates.map((template) => (
                      <button
                        key={template.id}
                        onClick={() => loadTemplate(template.id)}
                        className="w-full p-4 rounded-xl bg-slate-900/60 border border-slate-800 text-left hover:border-teal-500/40 transition block"
                      >
                        <h4 className="font-semibold text-sm">{template.name}</h4>
                        <p className="text-xs text-slate-400 mt-1">{template.description}</p>
                        <span className="inline-block mt-2 px-2 py-0.5 rounded bg-slate-950 border border-slate-800 text-[10px] text-teal-300 font-mono">
                          {template.language}
                        </span>
                      </button>
                    ))}
                  </div>

                  {selectedTemplate && (
                    <div className="p-4 rounded-xl bg-slate-900/40 border border-slate-800 space-y-3">
                      <h4 className="font-bold text-sm text-teal-400">Blueprint: {selectedTemplate.name}</h4>
                      {selectedTemplate.files.map((file: any, i: number) => (
                        <div key={i} className="space-y-1">
                          <span className="text-[10px] font-mono text-slate-400 block">{file.path}</span>
                          <pre className="text-[10px] text-slate-300 bg-slate-950/80 p-2.5 rounded overflow-x-auto font-mono">
                            {file.content}
                          </pre>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>
        )}
      </main>
    </div>
  );
}
