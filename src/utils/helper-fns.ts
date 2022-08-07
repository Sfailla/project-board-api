import bcrypt from 'bcryptjs'

export const encryptPassword = async (password: string): Promise<string> => {
	return await bcrypt.hash(password, String(process.env.SALT_ROUNDS))
}

export const decryptPassword = async (
	password: string,
	hashedPassword: string
): Promise<boolean> => {
	return await bcrypt.compare(password, hashedPassword)
}
