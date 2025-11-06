const IconEdit = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 18 18" fill="none">
    <path
      d="M5.23023 11.7L12.0761 4.85415L11.1216 3.8997L4.27578 10.7455V11.7H5.23023ZM5.78981 13.05H2.92578V10.186L10.6444 2.46735C10.771 2.3408 10.9426 2.26971 11.1216 2.26971C11.3006 2.26971 11.4723 2.3408 11.5989 2.46735L13.5084 4.37692C13.635 4.5035 13.7061 4.67516 13.7061 4.85415C13.7061 5.03313 13.635 5.20479 13.5084 5.33137L5.78981 13.05ZM2.92578 14.4H15.0758V15.75H2.92578V14.4Z"
      fill="currentColor"
      className="text-muted-foreground"
    />
  </svg>
);

const IconDelete = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 18 18" fill="none">
    <path
      d="M12.375 4.95H15.75V6.3H14.4V15.075C14.4 15.254 14.3289 15.4257 14.2023 15.5523C14.0757 15.6789 13.904 15.75 13.725 15.75H4.275C4.09598 15.75 3.92429 15.6789 3.7977 15.5523C3.67112 15.4257 3.6 15.254 3.6 15.075V6.3H2.25V4.95H5.625V2.925C5.625 2.74598 5.69612 2.57429 5.8227 2.4477C5.94929 2.32112 6.12098 2.25 6.3 2.25H11.7C11.879 2.25 12.0507 2.32112 12.1773 2.4477C12.3039 2.57429 12.375 2.74598 12.375 2.925V4.95ZM13.05 6.3H4.95V14.4H13.05V6.3ZM6.975 8.325H8.325V12.375H6.975V8.325ZM9.675 8.325H11.025V12.375H9.675V8.325ZM6.975 3.6V4.95H11.025V3.6H6.975Z"
      fill="currentColor"
      className="text-muted-foreground"
    />
  </svg>
);

const TrashIcon = ({ className = 'w-5 h-5' }: { className?: string }) => (
  <svg width="20" height="20" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg" className={className}>
    <path
      d="M6.66675 7.33301V11.333"
      stroke="currentColor"
      strokeWidth="1.33333"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
    <path
      d="M9.33325 7.33301V11.333"
      stroke="currentColor"
      strokeWidth="1.33333"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
    <path
      d="M2.66675 4.66699H13.3334"
      stroke="currentColor"
      strokeWidth="1.33333"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
    <path
      d="M4 4.66699H8H12V12.0003C12 13.1049 11.1046 14.0003 10 14.0003H6C4.89543 14.0003 4 13.1049 4 12.0003V4.66699Z"
      stroke="currentColor"
      strokeWidth="1.33333"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
    <path
      d="M6 3.33333C6 2.59695 6.59695 2 7.33333 2H8.66667C9.40305 2 10 2.59695 10 3.33333V4.66667H6V3.33333Z"
      stroke="currentColor"
      strokeWidth="1.33333"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </svg>
);

export { IconDelete, IconEdit, TrashIcon };
