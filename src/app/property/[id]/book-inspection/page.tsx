import BookInspection from '@/components/buyer/BookInspection';

interface PageProps {
  params: {
    id: string;
  };
}

export default async function BookInspectionPage({ params }: PageProps) {
  // Fetch available agents (you can also do this client-side)
  const availableAgents = [
    { id: 'A123', name: 'John Smith', availableSlots: ['2024-01-15T10:00:00Z', '2024-01-15T14:00:00Z'] },
    { id: 'A124', name: 'Sarah Johnson', availableSlots: ['2024-01-15T11:00:00Z', '2024-01-16T10:00:00Z'] },
    { id: 'A125', name: 'Michael Brown', availableSlots: ['2024-01-15T09:00:00Z', '2024-01-16T11:00:00Z'] }
  ];

  return (
    <div className="container mx-auto px-4 py-8">
      <BookInspection
        propertyId={params.id}
        propertyAddress="123 Example Street, Sydney NSW 2000"
        availableAgents={availableAgents}
      />
    </div>
  );
}