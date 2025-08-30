// Utility functions for Kinde API interactions
export const KINDE_CONFIG = {
    token: process.env.KINDE_M2M_TOKEN,
    baseUrl: process.env.KINDE_API_BASE_URL || 'https://auth.uditvegad.codes',
    timeout: 10000, // 10 seconds
} as const;

export interface KindeUserData {
    id: string;
    email: string;
    first_name: string;
    last_name: string;
    picture?: string;
    created_on: string;
    last_signed_in: string;
}

export interface ApiResponse<T = any> {
    success: boolean;
    data?: T;
    error?: string;
}

/**
 * Fetches user data from Kinde API with proper error handling
 */
export async function fetchKindeUser(userId: string): Promise<ApiResponse<KindeUserData>> {
    if (!KINDE_CONFIG.token) {
        return {
            success: false,
            error: 'KINDE_M2M_TOKEN is not configured'
        };
    }

    try {
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), KINDE_CONFIG.timeout);

        const response = await fetch(`${KINDE_CONFIG.baseUrl}/api/v1/user?id=${userId}`, {
            method: 'GET',
            headers: {
                'Authorization': `Bearer ${KINDE_CONFIG.token}`,
                'Content-Type': 'application/json'
            },
            signal: controller.signal
        });

        clearTimeout(timeoutId);

        if (!response.ok) {
            return {
                success: false,
                error: `API request failed: ${response.status} ${response.statusText}`
            };
        }

        const data = await response.json();
        return {
            success: true,
            data
        };
    } catch (error) {
        if (error && typeof error === 'object' && 'name' in error && error.name === 'AbortError') {
            return {
                success: false,
                error: 'Request timeout'
            };
        }

        return {
            success: false,
            error: `Unexpected error: ${error instanceof Error ? error.message : 'Unknown error'}`
        };
    }
}

/**
 * Updates user data in Kinde API
 */
export async function updateKindeUser(
    userId: string,
    data: {
        given_name?: string;
        family_name?: string;
        picture?: string;
    }
): Promise<ApiResponse> {
    if (!KINDE_CONFIG.token) {
        return {
            success: false,
            error: 'KINDE_M2M_TOKEN is not configured'
        };
    }

    try {
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), KINDE_CONFIG.timeout);

        const response = await fetch(`${KINDE_CONFIG.baseUrl}/api/v1/user?id=${userId}`, {
            method: 'PATCH',
            headers: {
                'Authorization': `Bearer ${KINDE_CONFIG.token}`,
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(data),
            signal: controller.signal
        });

        clearTimeout(timeoutId);

        if (!response.ok) {
            return {
                success: false,
                error: `API request failed: ${response.status} ${response.statusText}`
            };
        }

        const responseData = await response.json();
        return {
            success: true,
            data: responseData
        };
    } catch (error) {
        if (error && typeof error === 'object' && 'name' in error && error.name === 'AbortError') {
            return {
                success: false,
                error: 'Request timeout'
            };
        }

        return {
            success: false,
            error: `Unexpected error: ${error instanceof Error ? error.message : 'Unknown error'}`
        };
    }
}

/**
 * Validates environment variables
 */
export function validateKindeConfig(): { isValid: boolean; errors: string[] } {
    const errors: string[] = [];

    if (!process.env.KINDE_M2M_TOKEN) {
        errors.push('KINDE_M2M_TOKEN is required');
    }

    if (!process.env.KINDE_API_BASE_URL && !process.env.KINDE_ISSUER_URL) {
        errors.push('KINDE_API_BASE_URL or KINDE_ISSUER_URL is required');
    }

    return {
        isValid: errors.length === 0,
        errors
    };
}
