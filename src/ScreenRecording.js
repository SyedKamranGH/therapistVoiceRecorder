import React, { useRef, useState } from "react";
import "./styles/ScreenRecording.css";
import Button from "./components/button";
import TextElement from "./components/textElement";
import apiService from "./services/apiService";

function ScreenRecording() {
  const audioChunk = useRef([]);
  const [recordings, setRecordings] = useState([]);
  const mediaRecorderRef = useRef(null);
  const [streamRecording, setStreamRecording] = useState(false);

  const getStatusClassName = status => {
    switch (status) {
      case "Completed":
        return "completed-button";
      case "Uploading...":
        return "uploading-button";
      case "Processing...":
        return "processing-button";
      default:
        return "";
    }
  };

  const startRec = async () => {
    try {
      audioChunk.current = [];

      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const mediaRecorder = new MediaRecorder(stream);
      const startTime = Date.now();
      let sessionStatus = "Uploading...";

      mediaRecorder.ondataavailable = e => {
        if (e.data.size > 0) {
          audioChunk.current.push(e.data);
        }
      };

      mediaRecorder.onstop = async () => {
        const stopTime = Date.now();
        const audioBlob = new Blob(audioChunk.current, { type: "audio/wave" });
        const audioUrl = URL.createObjectURL(audioBlob);

        const uploadResponse = await apiService.uploadAudioData(audioBlob);
        console.log(uploadResponse);

        setRecordings(prevRecordings => [
          ...prevRecordings,
          {
            url: audioUrl,
            duration: Math.round((stopTime - startTime) / 1000),
            status: sessionStatus,
          },
        ]);

        setTimeout(() => {
          sessionStatus = "Processing...";
          setRecordings(prevRecordings =>
            prevRecordings.map((rec, index) =>
              index === prevRecordings.length - 1
                ? { ...rec, status: sessionStatus }
                : rec
            )
          );

          setTimeout(() => {
            sessionStatus = "Completed";
            setRecordings(prevRecordings =>
              prevRecordings.map((rec, index) =>
                index === prevRecordings.length - 1
                  ? { ...rec, status: sessionStatus }
                  : rec
              )
            );
          }, 5000);
        }, 5000);
      };

      mediaRecorderRef.current = mediaRecorder;
      mediaRecorder.start();
      setStreamRecording(true);
    } catch (error) {
      console.error("Error starting recording:", error);
    }
  };

  const stopRec = () => {
    try {
      if (
        mediaRecorderRef.current &&
        mediaRecorderRef.current.state === "recording"
      ) {
        mediaRecorderRef.current.stop();
        setStreamRecording(false);
      }
    } catch (error) {
      console.error("Error stopping recording:", error);
    }
  };

  const handleDownload = (url, index) => {
    const a = document.createElement("a");
    a.href = url;
    a.download = `recording-${index}.mp3`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
  };

  return (
    <div className="screen-recording-container">
      <h3 className="head">Recordings</h3>
      <div>
        {!streamRecording ? (
          <Button
            className="start-button"
            onClick={startRec}
            text="Start Recording"
          />
        ) : (
          <Button
            className="stop-button"
            onClick={stopRec}
            text="Stop Recording"
          />
        )}
      </div>
      <div className="recordings-list">
        {recordings.map((rec, index) => (
          <div key={index} className="recording-item">
            <TextElement
              className="head"
              label={`Session ${index + 1}`}
              value=""
            />
            <audio controls src={rec.url} />
            <TextElement
              className="head"
              label="Duration"
              value={`${rec.duration} secs`}
            />
            <TextElement
              className={getStatusClassName(rec.status)}
              label="Status"
              value={rec.status}
            />
            <Button
              className="download-button"
              onClick={() => handleDownload(rec.url, index)}
              text="Download"
            />
          </div>
        ))}
      </div>
    </div>
  );
}

export default ScreenRecording;
