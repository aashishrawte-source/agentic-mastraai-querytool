export class ComplianceGuard {
  static redactPII(text: string) {
    return text
      .replace(/\b[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}\b/gi, "[EMAIL]")
      .replace(/\b\d{10,}\b/g, "[PHONE]")
      .replace(/\b[A-Z][a-z]+\s[A-Z][a-z]+\b/g, "[NAME]");
  }

  static sanitizeBeforeLLM(candidateDocs: any[]) {
    return candidateDocs.map(doc => ({
      ...doc,
      document: this.redactPII(doc.document || ""),
      metadata: Object.fromEntries(
        Object.entries(doc.metadata || {}).map(([k, v]) =>
          /name|email|phone|gender/i.test(k) ? [k, "[REDACTED]"] : [k, v]
        )
      ),
    }));
  }

  static validateAfterLLM(output: string) {
    if (/\b[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}\b/i.test(output))
      throw new Error("PII leak detected");
    return output;
  }
}
