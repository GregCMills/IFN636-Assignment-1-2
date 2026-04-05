interface InlineErrorBannerProps {
  message: string;
  className?: string;
}

const InlineErrorBanner = ({ message, className }: InlineErrorBannerProps) => {
  if (!message) return null;
  return (
    <div className={`px-4 py-3 rounded-lg bg-status-danger-dim/40 border border-status-danger/30 text-status-danger text-sm${className ? ` ${className}` : ''}`}>
      {message}
    </div>
  );
};

export default InlineErrorBanner;
