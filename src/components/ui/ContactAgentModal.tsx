'use client';

import { initSocket,getSocket } from '@/lib/socket';
import { useEffect, useRef, useState } from 'react';
import { io, Socket } from 'socket.io-client';

type Sender = 'buyer' | 'agent';

interface Agent {
  id: string;
  name: string;
  title?: string;
  email?: string;
  phone?: string;
}

interface Message {
  _id?: string;
  clientId?: string; // client-side temp id for optimistic messages
  text: string;
  sender: string; // backend returns senderId
  receiver: string; // backend returns receiverId
  createdAt: string;
  status?: 'pending' | 'sent' | 'failed'; // client-side only (optimistic UX)
}

const timeShort = (iso: string) =>
  new Date(iso).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

// Merge an incoming socket message without duplicating the sender's own
// optimistic message: dedupe by _id, and reconcile a pending message (matched
// by sender + text) into "sent" instead of appending a copy.
const reconcileIncoming = (prev: Message[], msg: Message, myId?: string): Message[] => {
  if (msg._id && prev.some((m) => m._id && m._id === msg._id)) return prev;
  if (myId && msg.sender === myId) {
    const idx = prev.findIndex((m) => m.status === 'pending' && m.sender === myId && m.text === msg.text);
    if (idx !== -1) {
      const copy = [...prev];
      copy[idx] = { ...copy[idx], ...msg, status: 'sent' };
      return copy;
    }
  }
  return [...prev, msg];
};

export default function OneToOneChat({
  agent,
  propertyTitle,
}: {
  agent: Agent;
  propertyTitle: string;
}) {
console.log("🚀 ~ OneToOneChat ~ agent:", agent)

const backendBase = process.env.NEXT_PUBLIC_BACKEND_URL || process.env.NEXT_PUBLIC_API_URL?.replace('/api', '') || '';
const socket = io(backendBase, {
  withCredentials: true,
});
  console.log("🚀 ~ OneToOneChat ~ agent:", agent)
  const [user, setUser] = useState<{ id?: string; name?: string } | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [sending, setSending] = useState(false);
  const viewportRef = useRef<HTMLDivElement>(null);

  const apiUrl = backendBase || '';

  // Load auth
  useEffect(() => {
    if (typeof window === 'undefined') return;
    try {
      const rawUser = localStorage.getItem('user');
      const tok = localStorage.getItem('token');
      setUser(rawUser ? JSON.parse(rawUser) : null);
      setToken(tok || null);
    } catch {
      setUser(null);
      setToken(null);
    }
  }, []);

  // Fetch history
  useEffect(() => {
    if (!token || !user?.id || !agent?.id) return;
    fetch(`${apiUrl}/api/chatting/${agent.id}`, {
      headers: { Authorization: `Bearer ${token}` },
    })
      .then((res) => res.json())
      .then((data: Message[]) => setMessages(data || []))
      .catch((err) => console.error('Error loading chat:', err));
        // 2. Join room for this user (so server can emit directly)
  socket.emit("add-user", user.id);
  console.log("🚀 ~ OneToOneChat ~ user.id:", user.id)

  // 3. Listen for real-time messages
  socket.on("message", (msg: Message) => {
    setMessages((prev) => reconcileIncoming(prev, msg, user.id));
  });

  // Cleanup
  return () => {
    socket.off("message");
  };
  }, [token, user?.id, agent?.id, apiUrl]);

  // Socket setup
  useEffect(() => {
    if (!token || !user?.id) return;

    const socket: Socket = initSocket(token); // ✅ use helper
    socket.emit('add-user', user.id);

    socket.on('receive-message', (msg: Message) => {
      console.log('📩 Incoming:', msg);
      if (
        (msg.sender === user.id && msg.receiver === agent.id) ||
        (msg.sender === agent.id && msg.receiver === user.id)
      ) {
        setMessages((prev) => reconcileIncoming(prev, msg, user.id));
      }
    });

    return () => {
      socket.off('receive-message'); // cleanup
    };
  }, [token, user?.id, agent?.id]);

  // Auto-scroll
  useEffect(() => {
    const el = viewportRef.current;
    if (el) el.scrollTop = el.scrollHeight;
  }, [messages]);

  const handleSend = async () => {
    if (!input.trim() || !user?.id || !token) return;
    setSending(true);
    const text = input.trim();

    // Optimistic message: show as "pending" immediately, then flip to
    // "sent" on success or "failed" on error. clientId lets the socket echo
    // reconcile instead of duplicating (see reconcileIncoming).
    const clientId = `temp-${Date.now()}-${Math.floor(Math.random() * 1e6)}`;
    const optimistic: Message = {
      clientId,
      text,
      sender: user.id,
      receiver: agent.id,
      createdAt: new Date().toISOString(),
      status: 'pending',
    };
    setMessages((prev) => [...prev, optimistic]);
    setInput('');

    try {
      const res = await fetch(`${apiUrl}/api/chatting`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ receiverId: agent.id, text }),
      });
      if (!res.ok) throw new Error(`Request failed with status ${res.status}`);
      const newMsg = await res.json();
      console.log("🚀 ~ handleSend ~ newMsg:", newMsg)

      // Flip the optimistic message to "sent" and adopt the server fields/id.
      setMessages((prev) =>
        prev.map((m) => (m.clientId === clientId ? { ...m, ...newMsg, clientId, status: 'sent' } : m))
      );

      // Send via socket
      const socket = getSocket();
      socket?.emit('send-message', newMsg);
    } catch (err) {
      console.error('Send error:', err);
      setMessages((prev) => prev.map((m) => (m.clientId === clientId ? { ...m, status: 'failed' } : m)));
    } finally {
      setSending(false);
    }
  };

  const onKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const meId = user?.id;
  const agentInitial = agent?.name?.charAt(0) || 'A';

  return (
    <div className="mt-6 bg-white rounded-xl border overflow-hidden">
      {/* Header */}
      <div className="p-4 border-b flex items-center justify-between">
        <div className="flex items-center gap-3 min-w-0">
          <div className="w-10 h-10 rounded-full bg-blue-600 text-white flex items-center justify-center font-semibold">
            {agentInitial}
          </div>
          <div className="min-w-0">
            <p className="font-semibold truncate">{agent?.name || 'Agent'}</p>
            <p className="text-xs text-gray-500 truncate">
              {agent?.title || 'Real Estate Agent'}
            </p>
          </div>
        </div>
        {!token && (
          <a
            href="/signin"
            className="text-sm px-3 py-1.5 rounded-md bg-blue-600 text-white hover:bg-blue-700"
          >
            Sign in to chat
          </a>
        )}
      </div>

      {/* Messages */}
      <div
        ref={viewportRef}
        className="h-80 overflow-y-auto px-4 py-3 bg-gray-50"
      >
        <ul className="space-y-2">
          {Array.isArray(messages) &&
            messages.map((m) => {
              const mine = m.sender === meId;
              return (
                <li
                  key={m._id || m.clientId || `${m.sender}-${m.createdAt}`}
                  className={`flex ${mine ? 'justify-end' : 'justify-start'}`}
                >
                  <div
                    className={`max-w-[80%] rounded-2xl px-3 py-2 text-sm shadow-sm ${
                      mine
                        ? 'bg-blue-600 text-white rounded-br-sm'
                        : 'bg-white text-gray-900 border rounded-bl-sm'
                    }`}
                  >
                    <p className="whitespace-pre-wrap">{m.text}</p>
                    <div
                      className={`mt-1 text-[10px] ${
                        mine ? 'text-blue-100' : 'text-gray-400'
                      }`}
                    >
                      {mine ? 'You' : agent?.name || 'Agent'} •{' '}
                      {timeShort(m.createdAt)}
                      {mine && (
                        <span className="ml-2" aria-label={`Message ${m.status || 'sent'}`}>
                          {m.status === 'pending'
                            ? '⏳'
                            : m.status === 'failed'
                            ? '⚠ Failed'
                            : '✓✓'}
                        </span>
                      )}
                    </div>
                  </div>
                </li>
              );
            })}
        </ul>
      </div>

      {/* Composer */}
      <div className="p-3 border-t bg-white">
        <div className="flex items-end gap-2">
          <textarea
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={onKeyDown}
            rows={1}
            placeholder={token ? 'Write a message…' : 'Sign in to send a message'}
            disabled={!token || sending}
            className="flex-1 resize-none rounded-lg border border-gray-300 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:bg-gray-100"
          />
          <button
            type="button"
            onClick={handleSend}
            disabled={!token || sending || !input.trim()}
            className={`px-4 py-2 rounded-lg text-white font-medium transition-colors ${
              !token || sending || !input.trim()
                ? 'bg-gray-400 cursor-not-allowed'
                : 'bg-blue-600 hover:bg-blue-700'
            }`}
          >
            {sending ? 'Sending…' : 'Send'}
          </button>
        </div>
        <p className="mt-1 text-[11px] text-gray-400">
          Enter to send • Shift+Enter for newline
        </p>
      </div>
    </div>
  );
}
