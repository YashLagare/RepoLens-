
const ChannelListLoading = () => {
    return (
        <div className="px-4 space-y-2">
            {[...Array(5)].map((_, i) => (
                <div key={i} className="flex items-center gap-3 p-3 animate-pulse">
                    <div className="w-10 h-10 rounded-lg bg-white/10" />
                    <div className="flex-1 space-y-2">
                        <div className="h-3 bg-white/10 rounded w-3/4" />
                        <div className="h-2 bg-white/10 rounded w-1/2" />
                    </div>
                </div>
            ))}
        </div>
    );
};

export default ChannelListLoading;