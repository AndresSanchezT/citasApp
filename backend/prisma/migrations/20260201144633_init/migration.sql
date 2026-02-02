-- CreateTable
CREATE TABLE `citas` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `nombreCompleto` VARCHAR(255) NOT NULL,
    `telefono` VARCHAR(20) NOT NULL,
    `email` VARCHAR(255) NOT NULL,
    `tipoServicio` VARCHAR(100) NOT NULL,
    `fecha` DATETIME(3) NOT NULL,
    `hora` VARCHAR(10) NOT NULL,
    `estado` VARCHAR(50) NOT NULL DEFAULT 'pendiente',
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
