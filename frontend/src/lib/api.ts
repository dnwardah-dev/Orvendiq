export interface LoginResponse {
  accessToken: string
  tokenType: string
  expiresIn: number
}

export interface FraudAssessment {
  transactionId: number
  riskScore: number
  riskLevel: 'LOW' | 'MEDIUM' | 'HIGH'
  indicators: string
  assessedAt: string
}

export async function login(
  username: string,
  password: string
): Promise<LoginResponse> {
  const response = await fetch('/api/v1/auth/login', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ username, password }),
    cache: 'no-store',
  })

  if (!response.ok) {
    if (response.status === 401) {
      throw new Error('Username atau password tidak sesuai.')
    }
    throw new Error('Login gagal. Silakan coba lagi.')
  }

  return response.json() as Promise<LoginResponse>
}

export async function getFraudAssessment(
  transactionId: number,
  accessToken: string
): Promise<FraudAssessment> {
  const response = await fetch(
    `/api/v1/fraud/assessments/${transactionId}`,
    {
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
      cache: 'no-store',
    }
  )

  if (!response.ok) {
    if (response.status === 401) {
      throw new Error('Sesi login tidak valid atau kedaluwarsa.')
    }
    if (response.status === 403) {
      throw new Error('Kamu tidak memiliki izin mengakses data ini.')
    }
    if (response.status === 404) {
      throw new Error('FRAUD_ASSESSMENT_PENDING')
    }
    throw new Error('Gagal mengambil data fraud assessment.')
  }

  return response.json() as Promise<FraudAssessment>
}