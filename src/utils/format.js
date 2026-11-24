export const formatPrice = (amount) => {
  if (!amount && amount !== 0) return '—';
  return '₹' + parseFloat(amount).toLocaleString('en-IN', {
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  });
};

export const formatDate = (dateStr) => {
  if (!dateStr) return '';
  return new Date(dateStr).toLocaleDateString('en-IN', {
    day: '2-digit', month: 'short', year: 'numeric',
  });
};

export const getStatusColor = (status) => {
  const map = {
    pending: '#F59E0B',
    confirmed: '#3B82F6',
    processing: '#8B5CF6',
    shipped: '#06B6D4',
    out_for_delivery: '#10B981',
    delivered: '#22C55E',
    cancelled: '#EF4444',
  };
  return map[status] || '#6B7280';
};
