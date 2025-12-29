import { useEffect } from 'react'
import { useRouter } from 'next/router'
import { isAuthenticated, getUser } from '../../services/authService'

export default function AdminIndexRedirect() {
	const router = useRouter()

	useEffect(() => {
		if (!isAuthenticated()) {
			router.replace('/')
			return
		}

		const user = getUser()

		if (user?.isAdmin || user?.roles?.includes('ADMIN')) {
			router.replace('/admin/dashboard')
		} else {
			router.replace('/')
		}
	}, [router])

	return null
}