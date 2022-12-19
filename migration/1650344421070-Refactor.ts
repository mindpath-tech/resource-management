import { MigrationInterface, QueryRunner } from 'typeorm';

export class Refactor1650344421070 implements MigrationInterface {
  name = 'Refactor1650344421070';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `CREATE TABLE \`ratings\` (\`key\` int NOT NULL AUTO_INCREMENT, \`id\` varchar(36) NOT NULL, \`createAt\` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6), \`updateAt\` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6) ON UPDATE CURRENT_TIMESTAMP(6), \`version\` int NOT NULL DEFAULT '1', \`deleted\` tinyint NOT NULL DEFAULT 0, \`agentId\` text NULL, \`groupId\` text NULL, \`rating\` int NOT NULL, \`conversationKey\` int NOT NULL, UNIQUE INDEX \`IDX_0f31425b073219379545ad68ed\` (\`id\`), PRIMARY KEY (\`key\`)) ENGINE=InnoDB`,
    );
    await queryRunner.query(
      `CREATE TABLE \`hardwareRequest\` (\`key\` int NOT NULL AUTO_INCREMENT, \`id\` varchar(36) NOT NULL, \`createAt\` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6), \`updateAt\` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6) ON UPDATE CURRENT_TIMESTAMP(6), \`version\` int NOT NULL DEFAULT '1', \`deleted\` tinyint NOT NULL DEFAULT 0, \`userKey\` int NOT NULL, \`hardwareId\` varchar(50) NOT NULL, \`priority\` varchar(50) NOT NULL, \`status\` varchar(50) NOT NULL, \`remark\` text NULL, \`requestedQuantity\` int NOT NULL DEFAULT '0', \`allocatedQuantity\` int NOT NULL DEFAULT '0', \`requestType\` varchar(50) NOT NULL, \`description\` text NULL, \`deliveryOption\` text NOT NULL, \`deliveryAddress\` text NULL, \`conversationKey\` int NOT NULL, UNIQUE INDEX \`IDX_d52fb82b5efb95f2d54a0ad463\` (\`id\`), INDEX \`IDX_ec6a4bddc0163525ccf38a5dc0\` (\`hardwareId\`), INDEX \`IDX_5bf67bf1bd9ec6ac09b3c5f235\` (\`priority\`), INDEX \`IDX_7a9ac149f3dffa515159016e54\` (\`status\`), INDEX \`IDX_f869bc5562fbaa2bebd47d9769\` (\`requestType\`), UNIQUE INDEX \`REL_892458f36e468dadb7f3f31195\` (\`conversationKey\`), PRIMARY KEY (\`key\`)) ENGINE=InnoDB`,
    );
    await queryRunner.query(
      `CREATE TABLE \`users\` (\`key\` int NOT NULL AUTO_INCREMENT, \`id\` varchar(36) NOT NULL, \`createAt\` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6), \`updateAt\` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6) ON UPDATE CURRENT_TIMESTAMP(6), \`version\` int NOT NULL DEFAULT '1', \`deleted\` tinyint NOT NULL DEFAULT 0, \`firstName\` text NOT NULL, \`lastName\` text NULL, \`email\` text NULL, \`avatar\` text NULL, \`phone\` text NULL, \`botUserId\` varchar(250) NULL, \`agentChannelUserId\` text NULL, \`type\` varchar(255) NOT NULL DEFAULT 'User', UNIQUE INDEX \`IDX_a3ffb1c0c8416b9fc6f907b743\` (\`id\`), UNIQUE INDEX \`IDX_255bff962095dedaaab31d7eb3\` (\`botUserId\`), PRIMARY KEY (\`key\`)) ENGINE=InnoDB`,
    );
    await queryRunner.query(
      `CREATE TABLE \`conversations\` (\`key\` int NOT NULL AUTO_INCREMENT, \`id\` varchar(36) NOT NULL, \`createAt\` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6), \`updateAt\` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6) ON UPDATE CURRENT_TIMESTAMP(6), \`version\` int NOT NULL DEFAULT '1', \`deleted\` tinyint NOT NULL DEFAULT 0, \`botConversationId\` varchar(250) NOT NULL, \`botChannelType\` text NOT NULL, \`agentChannelConversationId\` varchar(50) NULL, \`agentChannelType\` text NULL, \`status\` text NOT NULL, \`skipResolveOperation\` tinyint NOT NULL DEFAULT 0, \`agentId\` text NULL, \`userKey\` int NULL, UNIQUE INDEX \`IDX_ee34f4f7ced4ec8681f26bf04e\` (\`id\`), INDEX \`IDX_6e15e51daa80fd9ce0e0577c89\` (\`botConversationId\`), INDEX \`IDX_de60cddb1fba78c38c2706ad38\` (\`agentChannelConversationId\`), UNIQUE INDEX \`REL_7ac3ebf15feabe90f05002017d\` (\`userKey\`), PRIMARY KEY (\`key\`)) ENGINE=InnoDB`,
    );
    await queryRunner.query(
      `CREATE TABLE \`conversationReferences\` (\`key\` int NOT NULL AUTO_INCREMENT, \`id\` varchar(36) NOT NULL, \`createAt\` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6), \`updateAt\` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6) ON UPDATE CURRENT_TIMESTAMP(6), \`version\` int NOT NULL DEFAULT '1', \`deleted\` tinyint NOT NULL DEFAULT 0, \`botConversationId\` varchar(250) NOT NULL, \`conversationReference\` json NOT NULL, UNIQUE INDEX \`IDX_b9b1b2fc7e0788efa0657f8416\` (\`id\`), INDEX \`IDX_b244b8c46a959dce9929f82077\` (\`botConversationId\`), PRIMARY KEY (\`key\`)) ENGINE=InnoDB`,
    );
    await queryRunner.query(
      `CREATE TABLE \`emailRecipients\` (\`key\` int NOT NULL AUTO_INCREMENT, \`id\` varchar(36) NOT NULL, \`createAt\` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6), \`updateAt\` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6) ON UPDATE CURRENT_TIMESTAMP(6), \`version\` int NOT NULL DEFAULT '1', \`deleted\` tinyint NOT NULL DEFAULT 0, \`name\` varchar(100) NOT NULL, \`email\` varchar(100) NOT NULL, \`timezone\` varchar(100) NOT NULL, \`emailType\` varchar(100) NOT NULL, UNIQUE INDEX \`IDX_5df371b42b1dcc2b0879bcdea6\` (\`id\`), UNIQUE INDEX \`unique_email_for_type\` (\`email\`, \`emailType\`), PRIMARY KEY (\`key\`)) ENGINE=InnoDB`,
    );
    await queryRunner.query(
      `ALTER TABLE \`ratings\` ADD CONSTRAINT \`FK_82d95f9af0492198a6afa2999fa\` FOREIGN KEY (\`conversationKey\`) REFERENCES \`conversations\`(\`key\`) ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE \`hardwareRequest\` ADD CONSTRAINT \`FK_3846fdf0f0c56cf83055eaa6ea0\` FOREIGN KEY (\`userKey\`) REFERENCES \`users\`(\`key\`) ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE \`hardwareRequest\` ADD CONSTRAINT \`FK_892458f36e468dadb7f3f31195e\` FOREIGN KEY (\`conversationKey\`) REFERENCES \`conversations\`(\`key\`) ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE \`conversations\` ADD CONSTRAINT \`FK_7ac3ebf15feabe90f05002017d2\` FOREIGN KEY (\`userKey\`) REFERENCES \`users\`(\`key\`) ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`ALTER TABLE \`conversations\` DROP FOREIGN KEY \`FK_7ac3ebf15feabe90f05002017d2\``);
    await queryRunner.query(`ALTER TABLE \`hardwareRequest\` DROP FOREIGN KEY \`FK_892458f36e468dadb7f3f31195e\``);
    await queryRunner.query(`ALTER TABLE \`hardwareRequest\` DROP FOREIGN KEY \`FK_3846fdf0f0c56cf83055eaa6ea0\``);
    await queryRunner.query(`ALTER TABLE \`ratings\` DROP FOREIGN KEY \`FK_82d95f9af0492198a6afa2999fa\``);
    await queryRunner.query(`DROP INDEX \`unique_email_for_type\` ON \`emailRecipients\``);
    await queryRunner.query(`DROP INDEX \`IDX_5df371b42b1dcc2b0879bcdea6\` ON \`emailRecipients\``);
    await queryRunner.query(`DROP TABLE \`emailRecipients\``);
    await queryRunner.query(`DROP INDEX \`IDX_b244b8c46a959dce9929f82077\` ON \`conversationReferences\``);
    await queryRunner.query(`DROP INDEX \`IDX_b9b1b2fc7e0788efa0657f8416\` ON \`conversationReferences\``);
    await queryRunner.query(`DROP TABLE \`conversationReferences\``);
    await queryRunner.query(`DROP INDEX \`REL_7ac3ebf15feabe90f05002017d\` ON \`conversations\``);
    await queryRunner.query(`DROP INDEX \`IDX_de60cddb1fba78c38c2706ad38\` ON \`conversations\``);
    await queryRunner.query(`DROP INDEX \`IDX_6e15e51daa80fd9ce0e0577c89\` ON \`conversations\``);
    await queryRunner.query(`DROP INDEX \`IDX_ee34f4f7ced4ec8681f26bf04e\` ON \`conversations\``);
    await queryRunner.query(`DROP TABLE \`conversations\``);
    await queryRunner.query(`DROP INDEX \`IDX_255bff962095dedaaab31d7eb3\` ON \`users\``);
    await queryRunner.query(`DROP INDEX \`IDX_a3ffb1c0c8416b9fc6f907b743\` ON \`users\``);
    await queryRunner.query(`DROP TABLE \`users\``);
    await queryRunner.query(`DROP INDEX \`REL_892458f36e468dadb7f3f31195\` ON \`hardwareRequest\``);
    await queryRunner.query(`DROP INDEX \`IDX_f869bc5562fbaa2bebd47d9769\` ON \`hardwareRequest\``);
    await queryRunner.query(`DROP INDEX \`IDX_7a9ac149f3dffa515159016e54\` ON \`hardwareRequest\``);
    await queryRunner.query(`DROP INDEX \`IDX_5bf67bf1bd9ec6ac09b3c5f235\` ON \`hardwareRequest\``);
    await queryRunner.query(`DROP INDEX \`IDX_ec6a4bddc0163525ccf38a5dc0\` ON \`hardwareRequest\``);
    await queryRunner.query(`DROP INDEX \`IDX_d52fb82b5efb95f2d54a0ad463\` ON \`hardwareRequest\``);
    await queryRunner.query(`DROP TABLE \`hardwareRequest\``);
    await queryRunner.query(`DROP INDEX \`IDX_0f31425b073219379545ad68ed\` ON \`ratings\``);
    await queryRunner.query(`DROP TABLE \`ratings\``);
  }
}
