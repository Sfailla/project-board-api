import { postgresdb } from '../config/postgres-db'
import { Card } from '../entities/card'
import { Arg, Ctx, ID, Mutation, Query, Resolver, UseMiddleware } from 'type-graphql'
import { Context } from '../types/shared'
import { isAuthenticated } from '../middleware/isAuthenticated'

@Resolver()
export class CardResolver {
	@UseMiddleware(isAuthenticated)
	@Query(() => [Card])
	async getCards(@Ctx() { req }: Context): Promise<Card[]> {
		const cards = await postgresdb
			.getRepository(Card)
			.find({ where: { userId: req.user?.id }, relations: ['user'] })

		return cards
	}

	@UseMiddleware(isAuthenticated)
	@Query(() => Card)
	async getCardById(@Arg('id', () => ID) id: string, @Ctx() { req }: Context): Promise<Card> {
		const card = await postgresdb
			.getRepository(Card)
			.findOne({ where: { id, userId: req.user?.id }, relations: ['user'] })

		if (!card) throw new Error('Card not found with that id')

		return card
	}

	@UseMiddleware(isAuthenticated)
	@Mutation(() => Card)
	async createCard(
		@Arg('title') title: string,
		@Arg('description') description: string,
		@Arg('projectId') projectId: string,
		@Ctx() { req }: Context
	): Promise<Card> {
		const card = await postgresdb
			.getRepository(Card)
			.create({
				userId: req.user?.id,
				title,
				description,
				projectId
			})
			.save()

		if (!card) throw new Error('Card not found with that id')

		return card
	}

	@UseMiddleware(isAuthenticated)
	@Mutation(() => Card)
	async updateCard(
		@Arg('id', () => ID) id: string,
		@Arg('title') title: string,
		@Arg('description') description: string,
		@Ctx() { req }: Context
	): Promise<Card> {
		const card = await postgresdb
			.getRepository(Card)
			.findOne({ where: { id, userId: req.user?.id }, relations: ['user'] })

		if (!card) throw new Error('Card not found with that id')

		const updatedCard = {
			...card,
			title,
			description
		}

		return await postgresdb.getRepository(Card).save(updatedCard)
	}

	@UseMiddleware(isAuthenticated)
	@Mutation(() => Card)
	async deleteCard(@Arg('id', () => ID) id: string, @Ctx() { req }: Context): Promise<Card> {
		const card = await postgresdb
			.getRepository(Card)
			.findOne({ where: { id, userId: req.user?.id }, relations: ['user'] })

		if (!card) throw new Error('Card not found with that id')

		return await postgresdb.getRepository(Card).remove(card)
	}
}
