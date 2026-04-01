
export const formatMongoDate = (mongoDate: any | undefined) => {
  if (!mongoDate?.$date) return "";
  return new Date(mongoDate.$date).toLocaleDateString('en-GB', {
    day: 'numeric',
    month: 'short'
  });
};