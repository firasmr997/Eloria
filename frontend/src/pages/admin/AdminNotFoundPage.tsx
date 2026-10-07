import { ButtonLink } from '@/components/ui/Button'
import { EmptyState } from '@/components/ui/Feedback'

export default function AdminNotFoundPage() {
  return <EmptyState title="This admin page does not exist." action={<ButtonLink to="/admin" size="sm" arrow>Back to the dashboard</ButtonLink>} />
}
