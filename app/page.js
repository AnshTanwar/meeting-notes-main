// app/page.js

'use client';
import { useState } from "react";
import { Input, Button, Textarea, DatePicker, Loading, Spacer, Divider } from "@nextui-org/react";
import Image from "next/image";
import { Table, TableHeader, TableColumn, TableBody, TableRow, TableCell } from "@nextui-org/react";


export default function Home() {
  // State for the meeting details
  const [meetingHost, setMeetingHost] = useState("");
  const [meetingAgenda, setMeetingAgenda] = useState("");
  const [meetingOutcomes, setMeetingOutcomes] = useState("");
  const [meetingDate, setMeetingDate] = useState(null);

  const [transcriptionResult, setTranscriptionResult] = useState(null);
  const [geminiResult, setGeminiResult] = useState(null);

  // State for participants
  const [participants, setParticipants] = useState([
    { name: "", email: "" },
  ]);

  // State for uploaded files
  const [uploadedFiles, setUploadedFiles] = useState([]);

  // State for transcription
  const [transcription, setTranscription] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");

  // Handler to add a new participant
  const addParticipant = () => {
    setParticipants([...participants, { name: "", email: "" }]);
  };

  // Handler to remove a participant by index
  const removeParticipant = (index) => {
    const updatedParticipants = participants.filter((_, i) => i !== index);
    setParticipants(updatedParticipants);
  };

  // Handler to update participant details
  const handleParticipantChange = (index, field, value) => {
    const updatedParticipants = participants.map((participant, i) => {
      if (i === index) {
        return { ...participant, [field]: value };
      }
      return participant;
    });
    setParticipants(updatedParticipants);
  };

  // Handler for file upload
  const handleFileChange = (event) => {
    const files = Array.from(event.target.files);
    const validTypes = ['audio/mpeg', 'audio/mp4', 'audio/wav', 'video/mp4', 'video/mpeg', 'video/quicktime'];
    const maxSize = 50 * 1024 * 1024; // 50MB

    const filteredFiles = files.filter(file => {
      if (!validTypes.includes(file.type)) {
        setError(`Unsupported file type: ${file.type}`);
        return false;
      }
      if (file.size > maxSize) {
        setError(`File size exceeds limit: ${file.name}`);
        return false;
      }
      return true;
    });

    if (filteredFiles.length !== files.length) {
      // Some files were invalid
      return;
    }

    setError(""); // Reset error if any
    setUploadedFiles((prevFiles) => [...prevFiles, ...filteredFiles]);
  };

  // Handler to remove a file by index
  const removeFile = (index) => {
    const updatedFiles = uploadedFiles.filter((_, i) => i !== index);
    setUploadedFiles(updatedFiles);
  };

  // Handler for form submission
  const handleSubmit = async () => {
    setIsLoading(true);
    setError("");
    setTranscriptionResult(null);

    if (!meetingHost || !meetingAgenda || !meetingOutcomes || participants.some(participant => !participant.name || !participant.email) || uploadedFiles.length === 0) {
      setError("Please fill in all fields and upload a file to generate notes.");
      setIsLoading(false);
      return;
    }

    // Prepare form data
    const formData = new FormData();
    if (uploadedFiles.length > 0) {
      formData.append("file", uploadedFiles[0]); // Assuming one file for transcription
    }

    try {
      // Send file to the backend API route
      const response = await fetch("/api/transcribe", {
        method: "POST",
        body: formData,
      });

      const data = await response.json();

      if (response.ok) {
        setTranscriptionResult(data.transcriptionResult);
        const transcript = [
          ...data.transcriptionResult.utterances.map((utterance) => {
            return [
              `Speaker ${utterance.speaker}`,
              utterance.text,
            ];
          }),
        ]
        console.log(transcript);
        //api gemini 
        //set this resp to gemini resp
        try {
          const newResponse = await fetch("https://hikemeetingapp.vercel.app/api/analyze-meeting", {
            method: "POST",
            body: JSON.stringify({
              "transcript": transcript,
            }),
            headers: {
              "Content-Type": "application/json",
            }
          });
          const newData = await newResponse.json();
          setGeminiResult(newData);
          console.log(newData);
        } catch (err) {
          console.error(err);
          setError("An unexpected error occurred.");
        }
      } else {
        setError(data.error || "An error occurred during transcription.");
      }
    } catch (err) {
      console.error(err);
      setError("An unexpected error occurred.");
    } finally {
      setIsLoading(false);
    }
  };

  if (!isLoading && !geminiResult) return (
    <div className="flex justify-center items-center w-full min-h-screen p-4 bg-gray-100">
      <div className="w-full max-w-5xl h-[90vh] shadow-xl bg-[#eeecf9] flex rounded-3xl overflow-hidden">
        {/* Left Panel */}
        <div className="bg-[#18185b] p-10 flex flex-col h-full gap-8 flex-1 text-white rounded-l-3xl">
          <div className="font-bold text-2xl"># Meeting Notes</div>
          <div className="font-bold text-xl">
            Implement post-meeting experience with just a few clicks.
          </div>
          <div className="text-gray-200">
            Get summary and notes using AI. Upload your meeting audio in file input.
          </div>
        </div>

        {/* Right Panel */}
        <div className="flex-[3] h-full p-10 gap-6 flex flex-col rounded-r-3xl overflow-y-auto">
          <div className="text-4xl font-black">Generate Meeting Notes</div>

          <span className="text-xl font-semibold">Meeting Metadata</span>

          {/* Meeting Host */}
          <Input
            clearable
            bordered
            label="Meeting Host"
            placeholder="Enter host name"
            value={meetingHost}
            onChange={(e) => setMeetingHost(e.target.value)}
          />

         

          {/* Meeting Agenda */}
          <Textarea
            bordered
            label="Meeting Agenda"
            placeholder="Enter meeting agenda"
            value={meetingAgenda}
            onChange={(e) => setMeetingAgenda(e.target.value)}
          />

          {/* Meeting Outcomes */}
          <Textarea
            bordered
            label="Meeting Outcomes"
            placeholder="Enter expected outcomes"
            value={meetingOutcomes}
            onChange={(e) => setMeetingOutcomes(e.target.value)}
          />

          {/* Participants Section */}
          <div className="flex flex-col gap-4">
            <div className="flex items-center justify-between">
              <span className="text-xl font-semibold">Participants</span>
              <Button color="secondary" variant="flat" auto onClick={addParticipant}>
                Add Participant
              </Button>
            </div>

            {participants.map((participant, index) => (
              <div
                key={index}
                className="flex flex-col gap-2 p-4 border rounded-xl bg-white shadow-sm"
              >
                <div className="flex flex-col sm:flex-row sm:gap-4">
                  <Input
                    clearable
                    bordered
                    label="Name"
                    placeholder="Participant Name"
                    value={participant.name}
                    onChange={(e) =>
                      handleParticipantChange(index, "name", e.target.value)
                    }
                    className="flex-1"
                  />
                  <Input
                    clearable
                    bordered
                    label="Email"
                    placeholder="Participant Email"
                    value={participant.email}
                    onChange={(e) =>
                      handleParticipantChange(index, "email", e.target.value)
                    }
                    className="flex-1"
                  />
                </div>
                <div className="flex justify-end">
                  <Button
                    color="default"
                    variant="flat"
                    light
                    onClick={() => removeParticipant(index)}
                  >
                    Remove
                  </Button>
                </div>
              </div>
            ))}
          </div>

          {/* File Upload Section */}
          <div className="flex flex-col gap-4">
            <div className="flex items-center justify-between">
              <span className="text-xl font-semibold">Upload Meeting Files</span>
            </div>

            <div className="flex flex-col gap-2">
              <input
                type="file"
                accept="audio/*,video/*"
                name="file"
                multiple
                onChange={handleFileChange}
                className="block w-full text-sm text-gray-500
    file:mr-4 file:py-2 file:px-4
    file:rounded-md file:border-0
    file:text-sm file:font-semibold
    file:bg-blue-50 file:text-blue-700
    hover:file:bg-blue-100"
              />
              {uploadedFiles.length > 0 && (
                <div className="mt-2">
                  <ul className="list-disc list-inside">
                    {uploadedFiles.map((file, index) => (
                      <li key={index} className="flex items-center justify-between">
                        <span>{file.name}</span>
                        <Button
                          size="xs"
                          color="error"
                          variant="light"
                          onClick={() => removeFile(index)}
                        >
                          Remove
                        </Button>
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          </div>

          {/* Transcription Section */}
          <div className="flex flex-col gap-2 mt-4">

            {isLoading && (
              <div className="flex items-center">
                {/* <Loading type="points" color="primary" /> */}
                <div>Loading ...</div>
                <Spacer x={0.5} />
                <span>Transcribing...</span>
              </div>
            )}

            {error && (
              <div className="text-red-500">
                {error}
              </div>
            )}
          </div>

          {/* Submit Button */}
          <div className="mt-6">
            <Button
              color="primary"
              size="lg"
              fullWidth
              onClick={handleSubmit}
              disabled={isLoading || uploadedFiles.length === 0}
            >
              {isLoading ? "Transcribing..." : "Generate Notes"}
            </Button>
          </div>
        </div>
      </div>
    </div>
  );

  else if (isLoading) return (
    <div className="flex w-[100vw] h-[100vh] justify-center items-center">
      <div className="loader"></div>
    </div>
  )

  else return (
    <div className="flex flex-col w-[100vw] gap-8 p-12 h-[100vh] bg-white">
      <h1>
        Meeting notes
      </h1>
      <div className="flex flex-col gap-4">
        <div>
          Host: {meetingHost}
        </div>
        <div>
          Agenda: {meetingAgenda}
        </div>
        <div>
          Outcomes: {meetingOutcomes}
        </div>
        <div>
          Participants:
          <Table>
            <TableHeader>
              <TableColumn>Name</TableColumn>
              <TableColumn>Email</TableColumn>
            </TableHeader>
            <TableBody>
              {participants.map((participant, index) => (
                <TableRow key={index}>
                  <TableCell>{participant.name}</TableCell>
                  <TableCell>{participant.email}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      </div>
      <Divider />
      <div>
        Discussion
      </div>
      <div>
        {
          geminiResult.data.summary.meeting_outcomes
        }
      </div>
      <div>
        {
          geminiResult.data.summary.discuss_steps
        }
      </div>
      <div>
        <div>Counter Points</div>
        {
          geminiResult.data.analysis.counterpoints.map((counterpoint, index) => (
            <div key={index}>
              {counterpoint}
            </div>
          ))

        }
      </div>
      <div>
        <div>Proposed Ideas</div>
        {
          geminiResult.data.analysis.proposed_ideas.map((idea, index) => (
            <div key={index}>
              {idea}
            </div>
          ))
        }
      </div>
      <Table>
        <TableHeader>
          <TableColumn>Actions and Insights</TableColumn>
          <TableColumn>DCI</TableColumn>
          <TableColumn>Decision Pending</TableColumn>
          <TableColumn>Importance</TableColumn>
        </TableHeader>
        <TableBody>
          {
            geminiResult.data.actions.map((action, index) => (
              <TableRow key={index}>
                <TableCell>{action.description}</TableCell>
                <TableCell>
                  D : {action.DRI},
                  C : {action.C[0]},
                  I : {action.I[0]}
                </TableCell>
                <TableCell>Y</TableCell>
                <TableCell>{action.Importance}</TableCell>
              </TableRow>
            ))
          }
        </TableBody>
        </Table>


      </div>
  )
}