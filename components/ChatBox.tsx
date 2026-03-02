'use client';

interface Message {
    id: string;
    text: string;
    senderId: string;
    createdAt: string;
}

interface ChatBoxProps {
    messages: Message[];
    currentUserId: string;
    otherName: string;
}

export default function ChatBox({ messages, currentUserId, otherName }: ChatBoxProps) {
    if (messages.length === 0) {
        return (
            <div className="flex-1 flex flex-col items-center justify-center text-center p-8">
                <div className="text-5xl mb-3">💬</div>
                <p className="text-gray-500 font-medium">Henüz mesaj yok</p>
                <p className="text-gray-400 text-sm mt-1">İlk mesajı sen gönder!</p>
            </div>
        );
    }

    return (
        <div className="flex-1 overflow-y-auto p-4 space-y-3">
            {messages.map((msg) => {
                const isOwn = msg.senderId === currentUserId;
                const time = msg.createdAt
                    ? new Date(msg.createdAt).toLocaleTimeString('tr-TR', { hour: '2-digit', minute: '2-digit' })
                    : '';
                return (
                    <div key={msg.id} className={`flex ${isOwn ? 'justify-end' : 'justify-start'}`}>
                        {!isOwn && (
                            <div className="w-7 h-7 rounded-full bg-gradient-to-br from-primary to-green-700 flex items-center justify-center text-white text-xs font-bold mr-2 flex-shrink-0 mt-auto">
                                {otherName.charAt(0).toUpperCase()}
                            </div>
                        )}
                        <div className={`max-w-[75%] group`}>
                            <div className={`px-4 py-2.5 rounded-2xl text-sm leading-relaxed ${isOwn
                                    ? 'bg-primary text-white rounded-br-sm'
                                    : 'bg-white border border-gray-200 text-gray-800 rounded-bl-sm shadow-sm'
                                }`}>
                                {msg.text}
                            </div>
                            <p className={`text-[10px] text-gray-400 mt-1 ${isOwn ? 'text-right' : 'text-left'}`}>
                                {time}
                            </p>
                        </div>
                    </div>
                );
            })}
        </div>
    );
}
