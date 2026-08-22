/**
 * Text-to-Speech (TTS) Conversational Audio Feedback
 * Delivers natural audio feedback for executed voice commands.
 */

class VoiceFeedbackService {
  private enabled = true;

  public setEnabled(enabled: boolean) {
    this.enabled = enabled;
  }

  public isEnabled(): boolean {
    return this.enabled;
  }

  public speak(text: string, locale = 'en-US'): void {
    if (!this.enabled || typeof window === 'undefined' || !window.speechSynthesis) {
      return;
    }

    try {
      window.speechSynthesis.cancel(); // Cancel any ongoing speech

      const cleanText = text
        .replace(/[\uD800-\uDBFF][\uDC00-\uDFFF]/g, '')
        .replace(/[\u2600-\u27BF]/g, '')
        .replace(/\b\d+\s+pcs\b/gi, '')
        .trim();



      if (!cleanText) return;

      const utterance = new SpeechSynthesisUtterance(cleanText);
      utterance.rate = 1.05;
      utterance.pitch = 1.0;
      utterance.lang = locale;

      // Select natural voice if available
      const voices = window.speechSynthesis.getVoices();
      const matchingVoice = voices.find(
        (v) => v.lang === locale || v.lang.startsWith(locale.substring(0, 2))
      );
      if (matchingVoice) {
        utterance.voice = matchingVoice;
      }

      window.speechSynthesis.speak(utterance);
    } catch (err) {
      console.warn('SpeechSynthesis error:', err);
    }
  }
}

export const voiceFeedbackService = new VoiceFeedbackService();
