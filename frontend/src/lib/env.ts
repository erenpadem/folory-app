/** Build-time flag: set NEXT_PUBLIC_APP_ENV=beta for beta deployments. */
export const IS_BETA = process.env.NEXT_PUBLIC_APP_ENV === "beta"
