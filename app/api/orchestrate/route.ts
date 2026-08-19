import { NextResponse } from 'next/server';
import { voiceOrchestrator } from '@/lib/orchestration/voiceOrchestrator';

export const runtime = 'nodejs';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { transcript, locale = 'en-US', source = 'text_manual', aggregate_id = 'list_default', aggregate_version } = body;

    if (!transcript || typeof transcript !== 'string' || !transcript.trim()) {
      return NextResponse.json(
        { error: 'INVALID_INPUT', message: 'Transcript cannot be empty' },
        { status: 400 }
      );
    }

    const output = await voiceOrchestrator.orchestrate({
      transcript,
      locale,
      source,
      aggregate_id,
      aggregate_version,
    });

    console.log(`[API /api/orchestrate] "${transcript}" -> Action: ${output.command.action} | Route: ${output.command.route} | Result: ${output.result.message}`);

    const response = NextResponse.json(output);


    // Set standard trace headers
    response.headers.set('X-Trace-Id', output.command.trace_id);
    response.headers.set('X-Request-Id', output.command.request_id);
    response.headers.set('X-Route', output.command.route);
    response.headers.set(
      'X-Parser-Latency-Ms',
      String(output.result.telemetry_summary?.parser_latency_ms || 0)
    );
    response.headers.set(
      'X-Total-Latency-Ms',
      String(output.result.telemetry_summary?.total_latency_ms || 0)
    );

    return response;
  } catch (error: any) {
    console.error('API /api/orchestrate Error:', error);
    return NextResponse.json(
      {
        error: 'ORCHESTRATION_FAILED',
        message: error?.message || 'Failed to process command through voice orchestrator',
      },
      { status: 500 }
    );
  }
}
