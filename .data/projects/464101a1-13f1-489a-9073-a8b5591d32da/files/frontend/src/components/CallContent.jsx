import {
    CallControls,
    CallingState,
    SpeakerLayout,
    StreamTheme,
    useCallStateHooks,
} from "@stream-io/video-react-sdk";

import { useEffect } from "react";
import { useNavigate } from "react-router";

const CallContent = () => {
    const { useCallCallingState } = useCallStateHooks();

    const callingState = useCallCallingState();
    const navigate = useNavigate();

    useEffect(() => {
        if (callingState === CallingState.LEFT) {
            navigate("/");
        }
    }, [callingState, navigate]);

    return (
        <StreamTheme>
            <SpeakerLayout />
            <CallControls />
        </StreamTheme>
    );
};

export default CallContent;