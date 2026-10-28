import WorkspaceSidebar from "./WorkspaceSidebar";

const MobileSidebar = ({
  chatClient,
  activeChannel,
  onChannelSelect,
  onClose,
  onCreateChannel,
}) => {
  return (
    <WorkspaceSidebar
      chatClient={chatClient}
      activeChannel={activeChannel}
      onChannelSelect={onChannelSelect}
      onCreateChannelClick={onCreateChannel}
      onCloseMobile={onClose}
      isMobile={true}
    />
  );
};

export default MobileSidebar;