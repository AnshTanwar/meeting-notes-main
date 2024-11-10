// app/api/transcribe/route.js

import { NextResponse } from 'next/server';
import axios from 'axios';

// Set the runtime to 'nodejs' to use Node.js APIs like Buffer
export const runtime = 'nodejs';

// AssemblyAI API Endpoints
const ASSEMBLYAI_UPLOAD_URL = 'https://api.assemblyai.com/v2/upload';
const ASSEMBLYAI_TRANSCRIPT_URL = 'https://api.assemblyai.com/v2/transcript';

// Helper function to upload file to AssemblyAI
const uploadFile = async (buffer, mimetype) => {
  try {
    const response = await axios.post(ASSEMBLYAI_UPLOAD_URL, buffer, {
      headers: {
        authorization: process.env.ASSEMBLYAI_API_KEY,
        'Content-Type': mimetype,
      },
    });
    return response.data.upload_url;
  } catch (error) {
    console.error('Error uploading file to AssemblyAI:', error.response?.data || error.message);
    throw new Error('Failed to upload file to AssemblyAI.');
  }
};

// Helper function to request transcription with configuration
const requestTranscription = async (audioUrl) => {
  try {
    const transcriptionConfig = {
      audio_url: audioUrl,
      speech_model: "best", // Replace with 'best' if available
      iab_categories: true,
      auto_highlights: true,
      entity_detection: true,
      speaker_labels: true,
      language_detection: true,
    };

    const response = await axios.post(ASSEMBLYAI_TRANSCRIPT_URL, transcriptionConfig, {
      headers: {
        authorization: process.env.ASSEMBLYAI_API_KEY,
        'Content-Type': 'application/json',
      },
    });
    return response.data.id;
  } catch (error) {
    console.error('Error requesting transcription:', error.response?.data || error.message);
    throw new Error('Failed to request transcription.');
  }
};

// Helper function to get transcription result
const getTranscriptionResult = async (transcriptionId) => {
  try {
    const transcriptionUrl = `${ASSEMBLYAI_TRANSCRIPT_URL}/${transcriptionId}`;
    const response = await axios.get(transcriptionUrl, {
      headers: {
        authorization: process.env.ASSEMBLYAI_API_KEY,
      },
    });
    return response.data;
  } catch (error) {
    console.error('Error fetching transcription result:', error.response?.data || error.message);
    throw new Error('Failed to fetch transcription result.');
  }
};

// Helper function to poll transcription status
// Helper function to poll transcription status
const pollTranscription = async (transcriptionId) => {
    let transcriptionResult = await getTranscriptionResult(transcriptionId);
  
    while (
      transcriptionResult.status !== 'completed' &&
      transcriptionResult.status !== 'error'
    ) {
      // Wait for 5 seconds before polling again
      await new Promise((resolve) => setTimeout(resolve, 5000));
      transcriptionResult = await getTranscriptionResult(transcriptionId);
    }
  
    if (transcriptionResult.status === 'completed') {
      return transcriptionResult; // Return the entire result
    } else {
      throw new Error('Transcription failed.');
    }
  };
// API Route Handler
export async function POST(req) {
  try {
    // Parse the incoming form data
    const formData = await req.formData();
    const file = formData.get('file');

    if (!file) {
      return NextResponse.json({ error: 'No file uploaded.' }, { status: 400 });
    }

    // Read the file as an ArrayBuffer and convert it to a Buffer
    const arrayBuffer = await file.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);
    const mimetype = file.type;

    // Upload the file to AssemblyAI
    const uploadUrl = await uploadFile(buffer, mimetype);

    // Request transcription with configuration
    const transcriptionId = await requestTranscription(uploadUrl);

    // Poll for transcription result
    const transcriptionResult = await pollTranscription(transcriptionId);

    // Return the transcription result
    return NextResponse.json({ transcriptionResult }, { status: 200 });
  } catch (error) {
    console.error('Error in transcription API:', error.message);
    return NextResponse.json(
      { error: error.message || 'Internal Server Error' },
      { status: 500 }
    );
  }
}