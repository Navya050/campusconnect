// This file is now deprecated - use shared/hooks/useAuth.ts instead
// Keeping for backward compatibility, but redirecting to new implementation

import { authAPI } from "../../../shared/hooks/useAuth";

// Re-export the new API for backward compatibility
export { authAPI };

// Note: This file should be removed once all references are updated to use the new hooks
// The new implementation is in shared/hooks/useAuth.ts and uses TanStack Query instead of axios
