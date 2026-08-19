import { NextResponse } from 'next/server';
import { sttGateway } from '@/lib/stt/sttGateway';

export const runtime = 'nodejs';

export async function POST(request: Request) {
  try {
    const formData = await request.formData();
    const audioFile = formData.get('file') as File | Blob | null;
    const language = (formData.get('language') as string) || 'en';
    const clientFallbackTranscript = (formData.get('client_transcript') as string) || '';

    if (!audioFile) {
      return NextResponse.json(
        { error: 'No audio file provided in request' },
        { status: 400 }
      );
    }

    const result = await sttGateway.transcribe(audioFile, language, clientFallbackTranscript);

    return NextResponse.json({
      success: true,
      transcript: result.transcript,
      model_used: result.model_used,
      confidence: result.confidence,
      duration_ms: result.duration_ms,
    });
  } catch (error: any) {
    console.error('STT Gateway Error:', error);
    return NextResponse.json(
      {
        error: 'TRANSCRIPTION_FAILED',
        message: error?.message || 'Failed to transcribe audio across model cascade',
      },
      { status: 500 }
    );
  }
}
