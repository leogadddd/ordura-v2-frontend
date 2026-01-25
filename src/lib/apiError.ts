export function formatApiError(err: any): string {
  try {
    const body = err?.response?.data;
    if (body) {
      if (body.status === "validation_error" && body.errors) {
        const parts: string[] = [];
        for (const k of Object.keys(body.errors)) {
          const msgs = body.errors[k];
          parts.push(`${k}: ${Array.isArray(msgs) ? msgs.join(", ") : msgs}`);
        }
        return `${body.message || "Validation failed"}: ${parts.join("; ")}`;
      }
      if (body.message) return body.message;
      if (typeof body === "string") return body;
    }
  } catch (e) {
    // ignore
  }
  return err?.message || String(err);
}

export function extractValidationErrors(
  err: any,
): Record<string, string> | null {
  const body = err?.response?.data;
  if (body && body.status === "validation_error" && body.errors) {
    const out: Record<string, string> = {};
    for (const k of Object.keys(body.errors)) {
      const msgs = body.errors[k];
      out[k] = Array.isArray(msgs) ? msgs.join(" ") : String(msgs);
    }
    return out;
  }
  return null;
}
