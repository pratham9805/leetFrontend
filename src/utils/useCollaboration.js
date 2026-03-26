import { useState, useEffect, useRef, useCallback } from 'react';
import { getSocket } from './socket';
import { useSelector } from 'react-redux';

/**
 * useCollaboration
 *
 * Encapsulates all real-time collaboration logic:
 *   – Socket connection / room management
 *   – Code sync (debounced, infinite-loop-safe via isRemoteUpdate flag)
 *   – Language sync
 *   – User-joined / user-left toasts
 *   – connectedUsers list
 */
export const useCollaboration = ({ onRemoteCodeChange, onRemoteLanguageChange }) => {
  const user = useSelector((s) => s.auth.user);

  const [isModalOpen,    setIsModalOpen]    = useState(false);
  const [roomId,         setRoomId]         = useState('');
  const [isInRoom,       setIsInRoom]       = useState(false);
  const [isConnecting,   setIsConnecting]   = useState(false);
  const [connectedUsers, setConnectedUsers] = useState([]);
  const [mySocketId,     setMySocketId]     = useState('');
  const [toasts,         setToasts]         = useState([]);

  // Flag to stop emitting back changes that came from remote
  const isRemoteUpdate = useRef(false);
  // Debounce timer
  const debounceTimer  = useRef(null);
  // Current roomId ref (stable inside event handlers)
  const roomIdRef      = useRef('');

  // User model uses firstName / lastName (not username/name)
  const myUsername = user
    ? [user.firstName, user.lastName].filter(Boolean).join(' ').trim() || user.emailId || 'Anonymous'
    : 'Anonymous';

  /* ── Toast helpers ── */
  const pushToast = useCallback((username, type) => {
    const id = `${Date.now()}-${Math.random()}`;
    setToasts((prev) => [...prev, { id, username, type }]);
    setTimeout(() => setToasts((prev) => prev.filter((t) => t.id !== id)), 3500);
  }, []);

  /* ── Socket setup ── */
  useEffect(() => {
    const socket = getSocket();

    socket.on('connect', () => {
      setMySocketId(socket.id);
    });

    // Someone joined  → update users list + toast
    socket.on('user-joined', ({ username, users }) => {
      setConnectedUsers(users);
      pushToast(username, 'joined');
    });

    // Full user list update
    socket.on('room-users', ({ users }) => {
      setConnectedUsers(users);
    });

    // Someone left → update users list + toast
    socket.on('user-left', ({ username, users }) => {
      setConnectedUsers(users);
      pushToast(username, 'left');
    });

    // Remote code update
    socket.on('code-update', ({ code, language }) => {
      isRemoteUpdate.current = true;
      onRemoteCodeChange(code, language);
      // Unset flag after React re-render cycle settles
      setTimeout(() => { isRemoteUpdate.current = false; }, 0);
    });

    // Remote language update
    socket.on('language-update', ({ language }) => {
      onRemoteLanguageChange(language);
    });

    // Capture socket id on reconnect
    socket.on('reconnect', () => setMySocketId(socket.id));

    return () => {
      socket.off('connect');
      socket.off('user-joined');
      socket.off('room-users');
      socket.off('user-left');
      socket.off('code-update');
      socket.off('language-update');
      socket.off('reconnect');
    };
  }, [onRemoteCodeChange, onRemoteLanguageChange, pushToast]);

  /* ── Sync initial socket ID ── */
  useEffect(() => {
    const socket = getSocket();
    if (socket.id) setMySocketId(socket.id);
  }, []);

  /* ── Create Room ── */
  const handleCreateRoom = useCallback((newRoomId) => {
    setIsConnecting(true);
    roomIdRef.current = newRoomId;
    setRoomId(newRoomId);

    const socket = getSocket();
    socket.emit('join-room', { roomId: newRoomId, username: myUsername });

    // Optimistically mark as in-room
    setIsInRoom(true);
    setIsConnecting(false);
  }, [myUsername]);

  /* ── Join Room ── */
  const handleJoinRoom = useCallback((targetRoomId) => {
    setIsConnecting(true);
    roomIdRef.current = targetRoomId;
    setRoomId(targetRoomId);

    const socket = getSocket();
    socket.emit('join-room', { roomId: targetRoomId, username: myUsername });

    setIsInRoom(true);
    setIsConnecting(false);
  }, [myUsername]);

  /* ── Leave Room ── */
  const leaveRoom = useCallback(() => {
    const currentRoomId = roomIdRef.current;
    if (!currentRoomId) return;

    const socket = getSocket();
    socket.emit('leave-room', { roomId: currentRoomId, username: myUsername });

    // Reset all local state
    roomIdRef.current = '';
    setRoomId('');
    setIsInRoom(false);
    setConnectedUsers([]);
  }, [myUsername]);

  /* ── Emit code change (debounced, skip if remote) ── */
  const emitCodeChange = useCallback((code, language) => {
    if (isRemoteUpdate.current) return;
    if (!isInRoom || !roomIdRef.current) return;

    clearTimeout(debounceTimer.current);
    debounceTimer.current = setTimeout(() => {
      const socket = getSocket();
      socket.emit('code-change', { roomId: roomIdRef.current, code, language });
    }, 120); // 120 ms debounce
  }, [isInRoom]);

  /* ── Emit language change ── */
  const emitLanguageChange = useCallback((language) => {
    if (!isInRoom || !roomIdRef.current) return;
    const socket = getSocket();
    socket.emit('language-change', { roomId: roomIdRef.current, language });
  }, [isInRoom]);

  return {
    // Modal state
    isModalOpen,
    openModal:  () => setIsModalOpen(true),
    closeModal: () => setIsModalOpen(false),
    // Room state
    roomId,
    isInRoom,
    isConnecting,
    connectedUsers,
    mySocketId,
    myUsername,
    // Handlers
    handleCreateRoom,
    handleJoinRoom,
    leaveRoom,
    emitCodeChange,
    emitLanguageChange,
    // Toasts
    toasts,
  };
};
