import { render, screen } from '@testing-library/react'
import StatsCard from '@/components/StatsCard'

describe('StatsCard', () => {
  it('renders with title and value', () => {
    render(
      <StatsCard
        title="Total Reports"
        value={42}
        icon="AlertTriangle"
      />
    )

    expect(screen.getByText('Total Reports')).toBeInTheDocument()
    expect(screen.getByText('42')).toBeInTheDocument()
  })

  it('renders with different icon types', () => {
    const { rerender } = render(
      <StatsCard
        title="Test"
        value={10}
        icon="AlertTriangle"
      />
    )

    expect(screen.getByText('Test')).toBeInTheDocument()

    rerender(
      <StatsCard
        title="Test"
        value={10}
        icon="CheckCircle"
      />
    )

    expect(screen.getByText('Test')).toBeInTheDocument()
  })

  it('handles string values', () => {
    render(
      <StatsCard
        title="Status"
        value="Active"
        icon="Activity"
      />
    )

    expect(screen.getByText('Status')).toBeInTheDocument()
    expect(screen.getByText('Active')).toBeInTheDocument()
  })

  it('handles zero values', () => {
    render(
      <StatsCard
        title="Empty"
        value={0}
        icon="AlertTriangle"
      />
    )

    expect(screen.getByText('Empty')).toBeInTheDocument()
    expect(screen.getByText('0')).toBeInTheDocument()
  })
})
