import { Query, Resolver } from 'type-graphql'

@Resolver()
export class UserReslover {
	@Query(() => String)
	hello(): string {
		return 'Hello World!'
	}
}
