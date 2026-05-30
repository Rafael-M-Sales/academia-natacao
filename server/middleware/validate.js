export function validate(schema) {
  return (req, res, next) => {
    const result = schema.safeParse(req.body);
    if (!result.success) {
      const messages = result.error.flatten().fieldErrors;
      const first = Object.entries(messages)
        .map(([field, msgs]) => `${field}: ${msgs.join(', ')}`)
        .join('; ');
      return res.status(400).json({ message: first || 'Dados inválidos' });
    }
    req.body = result.data;
    next();
  };
}
