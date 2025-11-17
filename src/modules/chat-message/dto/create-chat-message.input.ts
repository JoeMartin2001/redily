import { InputType, Int, Field } from '@nestjs/graphql';

@InputType()
export class CreateChatMessageInput {
  @Field(() => Int, { description: 'Example field (placeholder)' })
  exampleField: number;
}
