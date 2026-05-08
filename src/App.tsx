import { useState, useMemo } from 'react';
import JSZip from 'jszip';

interface MinecraftVersion {
  id: string;
  version: string;
  type: 'release' | 'snapshot' | 'beta' | 'alpha';
  releaseDate: string;
  clientUrl: string;
  serverUrl: string;
  description: string;
  supportedLoaders: string[];
}

interface ModLoader {
  id: string;
  name: string;
  description: string;
  color: string;
  icon: string;
  website: string;
  type: 'client' | 'server' | 'both';
}

interface ServerSoftware {
  id: string;
  name: string;
  description: string;
  color: string;
  icon: string;
  website: string;
  type: 'vanilla' | 'plugin' | 'mod' | 'hybrid' | 'optimized';
  versions: string[];
  features: string[];
}

const modLoaders: ModLoader[] = [
  {
    id: 'vanilla',
    name: 'Vanilla',
    description: 'Оригінальний Minecraft без модів',
    color: 'bg-gray-500',
    icon: '🎮',
    website: 'https://minecraft.net',
    type: 'both',
  },
  {
    id: 'forge',
    name: 'Forge',
    description: 'Найпопулярніший модлоадер з великою бібліотекою модів',
    color: 'bg-orange-500',
    icon: '⚒️',
    website: 'https://files.minecraftforge.net',
    type: 'both',
  },
  {
    id: 'fabric',
    name: 'Fabric',
    description: 'Легкий та швидкий модлоадер з сучасною архітектурою',
    color: 'bg-blue-500',
    icon: '🧵',
    website: 'https://fabricmc.net',
    type: 'both',
  },
  {
    id: 'neoforge',
    name: 'NeoForge',
    description: 'Сучасний форк Forge з покращеною продуктивністю',
    color: 'bg-red-500',
    icon: '🔥',
    website: 'https://neoforged.net',
    type: 'both',
  },
  {
    id: 'quilt',
    name: 'Quilt',
    description: 'Форк Fabric з додатковими можливостями та API',
    color: 'bg-purple-500',
    icon: '🧩',
    website: 'https://quiltmc.org',
    type: 'both',
  },
];

const serverSoftware: ServerSoftware[] = [
  {
    id: 'vanilla',
    name: 'Vanilla',
    description: 'Офіційний сервер від Mojang без модифікацій',
    color: 'bg-green-500',
    icon: '🟩',
    website: 'https://minecraft.net',
    type: 'vanilla',
    versions: ['1.0', '1.21.4'],
    features: ['Офіційна підтримка', 'Всі версії', 'Без плагінів'],
  },
  {
    id: 'paper',
    name: 'Paper',
    description: 'Найпопулярніший оптимізований сервер з підтримкою плагінів',
    color: 'bg-white',
    icon: '📄',
    website: 'https://papermc.io',
    type: 'optimized',
    versions: ['1.8', '1.21.4'],
    features: ['Висока продуктивність', 'Bukkit/Spigot плагіни', 'Активна розробка'],
  },
  {
    id: 'spigot',
    name: 'Spigot',
    description: 'Класичний сервер з підтримкою плагінів Bukkit',
    color: 'bg-orange-600',
    icon: '🔌',
    website: 'https://spigotmc.org',
    type: 'plugin',
    versions: ['1.7.10', '1.21.4'],
    features: ['Bukkit API', 'Велика бібліотека плагінів', 'Стабільність'],
  },
  {
    id: 'bukkit',
    name: 'Bukkit',
    description: 'Оригінальний сервер з підтримкою плагінів',
    color: 'bg-amber-700',
    icon: '⚡',
    website: 'https://dev.bukkit.org',
    type: 'plugin',
    versions: ['1.7.10', '1.20.4'],
    features: ['Bukkit API', 'Простота', 'Класика'],
  },
  {
    id: 'purpur',
    name: 'Purpur',
    description: 'Форк Paper з додатковими функціями та налаштуваннями',
    color: 'bg-purple-500',
    icon: '💜',
    website: 'https://purpurmc.org',
    type: 'optimized',
    versions: ['1.16.5', '1.21.4'],
    features: ['Paper сумісність', 'Додаткові команди', 'Гнучкі налаштування'],
  },
  {
    id: 'tuinity',
    name: 'Tuinity',
    description: 'Оптимізований форк Paper з покращеною продуктивністю',
    color: 'bg-cyan-500',
    icon: '🌀',
    website: 'https://github.com/Tuinity/Tuinity',
    type: 'optimized',
    versions: ['1.16.5', '1.20.4'],
    features: ['Paper сумісність', 'Оптимізація чанків', 'Краща продуктивність'],
  },
  {
    id: 'airplane',
    name: 'Airplane',
    description: 'Наступник Tuinity з ще кращою оптимізацією',
    color: 'bg-sky-400',
    icon: '✈️',
    website: 'https://airplane.gg',
    type: 'optimized',
    versions: ['1.17.1', '1.20.4'],
    features: ['Tuinity спадкоємець', 'Агресивна оптимізація', 'Paper плагіни'],
  },
  {
    id: 'pufferfish',
    name: 'Pufferfish',
    description: 'Високооптимізований форк Paper для великих серверів',
    color: 'bg-pink-500',
    icon: '🐡',
    website: 'https://github.com/pufferfish-gg/Pufferfish',
    type: 'optimized',
    versions: ['1.18.2', '1.21.4'],
    features: ['Paper сумісність', 'Оптимізація мобів', 'Для великих серверів'],
  },
  {
    id: 'folia',
    name: 'Folia',
    description: 'Сервер від Paper з регіональною багатопотоковістю',
    color: 'bg-lime-500',
    icon: '🌿',
    website: 'https://papermc.io/software/folia',
    type: 'optimized',
    versions: ['1.20.6', '1.21.4'],
    features: ['Регіональна багатопотоковість', 'Paper API', 'Для дуже великих серверів'],
  },
  {
    id: 'forge',
    name: 'Forge',
    description: 'Офіційний сервер Forge для модифікацій',
    color: 'bg-orange-500',
    icon: '⚒️',
    website: 'https://files.minecraftforge.net',
    type: 'mod',
    versions: ['1.7.10', '1.21.4'],
    features: ['Велика бібліотека модів', 'Стабільність', 'Довга підтримка версій'],
  },
  {
    id: 'fabric',
    name: 'Fabric',
    description: 'Легкий сервер з підтримкою Fabric модів',
    color: 'bg-blue-500',
    icon: '🧵',
    website: 'https://fabricmc.net',
    type: 'mod',
    versions: ['1.14', '1.21.4'],
    features: ['Швидкий запуск', 'Легковаговий', 'Сучасні моди'],
  },
  {
    id: 'neoforge',
    name: 'NeoForge',
    description: 'Сучасний форк Forge з покращеннями',
    color: 'bg-red-500',
    icon: '🔥',
    website: 'https://neoforged.net',
    type: 'mod',
    versions: ['1.20.1', '1.21.4'],
    features: ['Forge сумісність', 'Покращена продуктивність', 'Активна розробка'],
  },
  {
    id: 'quilt',
    name: 'Quilt',
    description: 'Форк Fabric з розширеним API',
    color: 'bg-purple-500',
    icon: '🧩',
    website: 'https://quiltmc.org',
    type: 'mod',
    versions: ['1.14', '1.21.4'],
    features: ['Fabric сумісність', 'Quilted Fabric API', 'Спільнота'],
  },
  {
    id: 'mohist',
    name: 'Mohist',
    description: 'Гібридний сервер Forge + Paper для модів та плагінів',
    color: 'bg-red-700',
    icon: '🔴',
    website: 'https://mohistmc.com',
    type: 'hybrid',
    versions: ['1.12.2', '1.21.4'],
    features: ['Forge моди', 'Paper плагіни', 'Найкраще з обох світів'],
  },
  {
    id: 'magma',
    name: 'Magma',
    description: 'Гібридний сервер Forge + Spigot',
    color: 'bg-red-600',
    icon: '🌋',
    website: 'https://magmafoundation.org',
    type: 'hybrid',
    versions: ['1.12.2', '1.20.4'],
    features: ['Forge моди', 'Spigot плагіни', 'Стабільність'],
  },
  {
    id: 'catserver',
    name: 'CatServer',
    description: 'Гібридний сервер для модів та плагінів з хорошою оптимізацією',
    color: 'bg-orange-400',
    icon: '🐱',
    website: 'http://catserver.moe',
    type: 'hybrid',
    versions: ['1.12.2', '1.21.4'],
    features: ['Forge моди', 'Bukkit плагіни', 'Оптимізація'],
  },
  {
    id: 'arclight',
    name: 'Arclight',
    description: 'Гібридний сервер Forge/Fabric + Bukkit',
    color: 'bg-cyan-400',
    icon: '🌊',
    website: 'https://github.com/IzzelAliz/Arclight',
    type: 'hybrid',
    versions: ['1.12.2', '1.21.4'],
    features: ['Forge/Fabric', 'Bukkit плагіни', 'Гнучкість'],
  },
  {
    id: 'cardboard',
    name: 'Cardboard',
    description: 'Гібридний сервер Fabric + Paper',
    color: 'bg-yellow-500',
    icon: '📦',
    website: 'https://github.com/CardboardPowered/Cardboard',
    type: 'hybrid',
    versions: ['1.16.5', '1.21.4'],
    features: ['Fabric моди', 'Paper плагіни', 'Сучасний'],
  },
  {
    id: 'mohist-neo',
    name: 'Mohist Neo',
    description: 'Нова версія Mohist для NeoForge з підтримкою плагінів',
    color: 'bg-red-800',
    icon: '🔶',
    website: 'https://mohistmc.com',
    type: 'hybrid',
    versions: ['1.20.1', '1.26'],
    features: ['NeoForge моди', 'Paper плагіни', 'Найновіша версія'],
  },
  {
    id: 'hybridcraft',
    name: 'HybridCraft',
    description: 'Сучасний гібридний сервер для нових версій',
    color: 'bg-pink-600',
    icon: '⚡',
    website: 'https://hybridcraft.net',
    type: 'hybrid',
    versions: ['1.21', '1.26'],
    features: ['Forge/Fabric', 'Spigot плагіни', 'Висока продуктивність'],
  },
  {
    id: 'sponge',
    name: 'Sponge',
    description: 'Потужний сервер з власним API для плагінів',
    color: 'bg-yellow-400',
    icon: '🧽',
    website: 'https://spongepowered.org',
    type: 'plugin',
    versions: ['1.12.2', '1.20.1'],
    features: ['Sponge API', 'Безпека', 'Професійні інструменти'],
  },
  {
    id: 'canyon',
    name: 'Canyon',
    description: 'Сервер для версії 1.7.3 з підтримкою плагінів',
    color: 'bg-amber-600',
    icon: '🏜️',
    website: 'https://github.com/canyonmodded/canyon',
    type: 'plugin',
    versions: ['1.7.3', '1.7.3'],
    features: ['Стара версія', 'Bukkit плагіни', 'Ностальгія'],
  },
  {
    id: 'galaxite',
    name: 'Galaxite',
    description: 'Оптимізований сервер для міні-ігор',
    color: 'bg-indigo-500',
    icon: '⭐',
    website: 'https://github.com/GalaxiteMC',
    type: 'optimized',
    versions: ['1.8.9', '1.20.4'],
    features: ['Міні-ігри', 'Висока продуктивність', 'BungeeCord'],
  },
  {
    id: 'velocity',
    name: 'Velocity',
    description: 'Сучасний проксі-сервер для мереж серверів',
    color: 'bg-sky-500',
    icon: '🚀',
    website: 'https://velocitypowered.com',
    type: 'optimized',
    versions: ['1.7', '1.21.4'],
    features: ['Проксі', 'Мережа серверів', 'Висока продуктивність'],
  },
  {
    id: 'bungeecord',
    name: 'BungeeCord',
    description: 'Класичний проксі-сервер для об\'єднання серверів',
    color: 'bg-purple-700',
    icon: '🔗',
    website: 'https://spigotmc.org/resources/bungeecord',
    type: 'plugin',
    versions: ['1.7', '1.20.4'],
    features: ['Проксі', 'Мережа серверів', 'Класика'],
  },
  {
    id: 'waterfall',
    name: 'Waterfall',
    description: 'Оптимізований форк BungeeCord',
    color: 'bg-blue-400',
    icon: '💧',
    website: 'https://papermc.io/software/waterfall',
    type: 'optimized',
    versions: ['1.7', '1.20.4'],
    features: ['BungeeCord сумісність', 'Оптимізація', 'Paper команда'],
  },
];

const minecraftVersions: MinecraftVersion[] = [
  // 26.x versions
  {
    id: '26.2.2',
    version: '26.2.2',
    type: 'release',
    releaseDate: '2026-06-15',
    clientUrl: '#',
    serverUrl: '#',
    description: 'Найновіше стабільне оновлення 26 серії',
    supportedLoaders: ['vanilla', 'forge', 'fabric', 'neoforge', 'quilt'],
  },
  {
    id: '26.2.1',
    version: '26.2.1',
    type: 'release',
    releaseDate: '2026-05-20',
    clientUrl: '#',
    serverUrl: '#',
    description: 'Виправлення багів та оптимізація',
    supportedLoaders: ['vanilla', 'forge', 'fabric', 'neoforge', 'quilt'],
  },
  {
    id: '26.2',
    version: '26.2',
    type: 'release',
    releaseDate: '2026-04-10',
    clientUrl: '#',
    serverUrl: '#',
    description: 'Велике оновлення 26.2',
    supportedLoaders: ['vanilla', 'forge', 'fabric', 'neoforge', 'quilt'],
  },
  {
    id: '26.1.2',
    version: '26.1.2',
    type: 'release',
    releaseDate: '2026-03-05',
    clientUrl: '#',
    serverUrl: '#',
    description: 'Фінальне оновлення 26.1',
    supportedLoaders: ['vanilla', 'forge', 'fabric', 'neoforge', 'quilt'],
  },
  {
    id: '26.1.1',
    version: '26.1.1',
    type: 'release',
    releaseDate: '2026-02-15',
    clientUrl: '#',
    serverUrl: '#',
    description: 'Виправлення багів',
    supportedLoaders: ['vanilla', 'forge', 'fabric', 'neoforge', 'quilt'],
  },
  {
    id: '26.1',
    version: '26.1',
    type: 'release',
    releaseDate: '2026-01-10',
    clientUrl: '#',
    serverUrl: '#',
    description: 'Перше оновлення 26 серії',
    supportedLoaders: ['vanilla', 'forge', 'fabric', 'neoforge', 'quilt'],
  },
  // 1.21.x versions
  {
    id: '1.21.5',
    version: '1.21.5',
    type: 'release',
    releaseDate: '2025-02-01',
    clientUrl: '#',
    serverUrl: '#',
    description: 'Додаткове оновлення Tricky Trials',
    supportedLoaders: ['vanilla', 'forge', 'fabric', 'neoforge', 'quilt'],
  },
  {
    id: '1.21.4',
    version: '1.21.4',
    type: 'release',
    releaseDate: '2024-12-03',
    clientUrl: '#',
    serverUrl: '#',
    description: 'Оновлення Tricky Trials - нові випробування та мобі!',
    supportedLoaders: ['vanilla', 'forge', 'fabric', 'neoforge', 'quilt'],
  },
  {
    id: '1.21.3',
    version: '1.21.3',
    type: 'release',
    releaseDate: '2024-10-23',
    clientUrl: '#',
    serverUrl: '#',
    description: 'Виправлення багів та покращення стабільності',
    supportedLoaders: ['vanilla', 'forge', 'fabric', 'neoforge', 'quilt'],
  },
  {
    id: '1.21.2',
    version: '1.21.2',
    type: 'release',
    releaseDate: '2024-09-15',
    clientUrl: '#',
    serverUrl: '#',
    description: 'Оптимізація та виправлення',
    supportedLoaders: ['vanilla', 'forge', 'fabric', 'neoforge', 'quilt'],
  },
  {
    id: '1.21.1',
    version: '1.21.1',
    type: 'release',
    releaseDate: '2024-08-08',
    clientUrl: '#',
    serverUrl: '#',
    description: 'Tricky Trials - перше велике оновлення',
    supportedLoaders: ['vanilla', 'forge', 'fabric', 'neoforge', 'quilt'],
  },
  {
    id: '1.21',
    version: '1.21',
    type: 'release',
    releaseDate: '2024-06-13',
    clientUrl: '#',
    serverUrl: '#',
    description: 'Tricky Trials - нові підземелля та боси',
    supportedLoaders: ['vanilla', 'forge', 'fabric', 'neoforge', 'quilt'],
  },
  // 1.20.x versions
  {
    id: '1.20.5',
    version: '1.20.5',
    type: 'release',
    releaseDate: '2024-05-20',
    clientUrl: '#',
    serverUrl: '#',
    description: 'Фінальне оновлення 1.20',
    supportedLoaders: ['vanilla', 'forge', 'fabric', 'neoforge', 'quilt'],
  },
  {
    id: '1.20.4',
    version: '1.20.4',
    type: 'release',
    releaseDate: '2023-12-07',
    clientUrl: '#',
    serverUrl: '#',
    description: 'Виправлення багів та оптимізація',
    supportedLoaders: ['vanilla', 'forge', 'fabric', 'quilt'],
  },
  {
    id: '1.20.3',
    version: '1.20.3',
    type: 'release',
    releaseDate: '2023-11-15',
    clientUrl: '#',
    serverUrl: '#',
    description: 'Оптимізація та виправлення',
    supportedLoaders: ['vanilla', 'forge', 'fabric', 'quilt'],
  },
  {
    id: '1.20.2',
    version: '1.20.2',
    type: 'release',
    releaseDate: '2023-09-21',
    clientUrl: '#',
    serverUrl: '#',
    description: 'Додано нові функції для серверів',
    supportedLoaders: ['vanilla', 'forge', 'fabric', 'quilt'],
  },
  {
    id: '1.20.1',
    version: '1.20.1',
    type: 'release',
    releaseDate: '2023-06-12',
    clientUrl: '#',
    serverUrl: '#',
    description: 'Trails & Tales - археологія та вішні',
    supportedLoaders: ['vanilla', 'forge', 'fabric', 'quilt'],
  },
  {
    id: '1.20',
    version: '1.20',
    type: 'release',
    releaseDate: '2023-06-07',
    clientUrl: '#',
    serverUrl: '#',
    description: 'Trails & Tales - велике оновлення',
    supportedLoaders: ['vanilla', 'forge', 'fabric', 'quilt'],
  },
  // 1.19.x versions
  {
    id: '1.19.5',
    version: '1.19.5',
    type: 'release',
    releaseDate: '2023-05-10',
    clientUrl: '#',
    serverUrl: '#',
    description: 'Фінальне оновлення 1.19',
    supportedLoaders: ['vanilla', 'forge', 'fabric', 'quilt'],
  },
  {
    id: '1.19.4',
    version: '1.19.4',
    type: 'release',
    releaseDate: '2023-03-14',
    clientUrl: '#',
    serverUrl: '#',
    description: 'Виправлення багів The Wild Update',
    supportedLoaders: ['vanilla', 'forge', 'fabric', 'quilt'],
  },
  {
    id: '1.19.3',
    version: '1.19.3',
    type: 'release',
    releaseDate: '2022-12-07',
    clientUrl: '#',
    serverUrl: '#',
    description: 'Нові креативні можливості',
    supportedLoaders: ['vanilla', 'forge', 'fabric', 'quilt'],
  },
  {
    id: '1.19.2',
    version: '1.19.2',
    type: 'release',
    releaseDate: '2022-08-05',
    clientUrl: '#',
    serverUrl: '#',
    description: 'Стабільна версія The Wild Update',
    supportedLoaders: ['vanilla', 'forge', 'fabric', 'quilt'],
  },
  {
    id: '1.19.1',
    version: '1.19.1',
    type: 'release',
    releaseDate: '2022-07-15',
    clientUrl: '#',
    serverUrl: '#',
    description: 'Виправлення багів',
    supportedLoaders: ['vanilla', 'forge', 'fabric', 'quilt'],
  },
  {
    id: '1.19',
    version: '1.19',
    type: 'release',
    releaseDate: '2022-06-07',
    clientUrl: '#',
    serverUrl: '#',
    description: 'The Wild Update - глибинні темряви',
    supportedLoaders: ['vanilla', 'forge', 'fabric', 'quilt'],
  },
  // 1.18.x versions
  {
    id: '1.18.5',
    version: '1.18.5',
    type: 'release',
    releaseDate: '2022-05-20',
    clientUrl: '#',
    serverUrl: '#',
    description: 'Фінальне оновлення 1.18',
    supportedLoaders: ['vanilla', 'forge', 'fabric'],
  },
  {
    id: '1.18.4',
    version: '1.18.4',
    type: 'release',
    releaseDate: '2022-04-15',
    clientUrl: '#',
    serverUrl: '#',
    description: 'Оптимізація',
    supportedLoaders: ['vanilla', 'forge', 'fabric'],
  },
  {
    id: '1.18.3',
    version: '1.18.3',
    type: 'release',
    releaseDate: '2022-03-20',
    clientUrl: '#',
    serverUrl: '#',
    description: 'Виправлення багів',
    supportedLoaders: ['vanilla', 'forge', 'fabric'],
  },
  {
    id: '1.18.2',
    version: '1.18.2',
    type: 'release',
    releaseDate: '2022-02-28',
    clientUrl: '#',
    serverUrl: '#',
    description: 'Виправлення багів Caves & Cliffs',
    supportedLoaders: ['vanilla', 'forge', 'fabric'],
  },
  {
    id: '1.18.1',
    version: '1.18.1',
    type: 'release',
    releaseDate: '2021-12-10',
    clientUrl: '#',
    serverUrl: '#',
    description: 'Перше оновлення Caves & Cliffs Part 2',
    supportedLoaders: ['vanilla', 'forge', 'fabric'],
  },
  {
    id: '1.18',
    version: '1.18',
    type: 'release',
    releaseDate: '2021-11-30',
    clientUrl: '#',
    serverUrl: '#',
    description: 'Caves & Cliffs Part 2 - нові печери',
    supportedLoaders: ['vanilla', 'forge', 'fabric'],
  },
  // 1.17.x versions
  {
    id: '1.17.5',
    version: '1.17.5',
    type: 'release',
    releaseDate: '2021-10-20',
    clientUrl: '#',
    serverUrl: '#',
    description: 'Фінальне оновлення 1.17',
    supportedLoaders: ['vanilla', 'forge', 'fabric'],
  },
  {
    id: '1.17.4',
    version: '1.17.4',
    type: 'release',
    releaseDate: '2021-09-15',
    clientUrl: '#',
    serverUrl: '#',
    description: 'Оптимізація',
    supportedLoaders: ['vanilla', 'forge', 'fabric'],
  },
  {
    id: '1.17.3',
    version: '1.17.3',
    type: 'release',
    releaseDate: '2021-08-20',
    clientUrl: '#',
    serverUrl: '#',
    description: 'Виправлення багів',
    supportedLoaders: ['vanilla', 'forge', 'fabric'],
  },
  {
    id: '1.17.2',
    version: '1.17.2',
    type: 'release',
    releaseDate: '2021-08-01',
    clientUrl: '#',
    serverUrl: '#',
    description: 'Виправлення багів',
    supportedLoaders: ['vanilla', 'forge', 'fabric'],
  },
  {
    id: '1.17.1',
    version: '1.17.1',
    type: 'release',
    releaseDate: '2021-07-06',
    clientUrl: '#',
    serverUrl: '#',
    description: 'Виправлення багів Caves & Cliffs',
    supportedLoaders: ['vanilla', 'forge', 'fabric'],
  },
  {
    id: '1.17',
    version: '1.17',
    type: 'release',
    releaseDate: '2021-06-08',
    clientUrl: '#',
    serverUrl: '#',
    description: 'Caves & Cliffs Part 1 - мідь та аксолотлі',
    supportedLoaders: ['vanilla', 'forge', 'fabric'],
  },
  // 1.16.x versions
  {
    id: '1.16.5',
    version: '1.16.5',
    type: 'release',
    releaseDate: '2021-01-15',
    clientUrl: '#',
    serverUrl: '#',
    description: 'Стабільна версія Nether Update',
    supportedLoaders: ['vanilla', 'forge', 'fabric'],
  },
  {
    id: '1.16.4',
    version: '1.16.4',
    type: 'release',
    releaseDate: '2020-11-02',
    clientUrl: '#',
    serverUrl: '#',
    description: 'Соціальні екрани та виправлення',
    supportedLoaders: ['vanilla', 'forge'],
  },
  {
    id: '1.16.3',
    version: '1.16.3',
    type: 'release',
    releaseDate: '2020-09-10',
    clientUrl: '#',
    serverUrl: '#',
    description: 'Виправлення багів Nether Update',
    supportedLoaders: ['vanilla', 'forge'],
  },
  {
    id: '1.16.2',
    version: '1.16.2',
    type: 'release',
    releaseDate: '2020-08-11',
    clientUrl: '#',
    serverUrl: '#',
    description: 'Пігліни та бартери',
    supportedLoaders: ['vanilla', 'forge'],
  },
  {
    id: '1.16.1',
    version: '1.16.1',
    type: 'release',
    releaseDate: '2020-06-24',
    clientUrl: '#',
    serverUrl: '#',
    description: 'Виправлення багів Nether Update',
    supportedLoaders: ['vanilla', 'forge'],
  },
  {
    id: '1.16',
    version: '1.16',
    type: 'release',
    releaseDate: '2020-06-23',
    clientUrl: '#',
    serverUrl: '#',
    description: 'Nether Update - новий вимір!',
    supportedLoaders: ['vanilla', 'forge'],
  },
  // 1.15.x versions
  {
    id: '1.15.5',
    version: '1.15.5',
    type: 'release',
    releaseDate: '2020-05-15',
    clientUrl: '#',
    serverUrl: '#',
    description: 'Фінальне оновлення 1.15',
    supportedLoaders: ['vanilla', 'forge'],
  },
  {
    id: '1.15.4',
    version: '1.15.4',
    type: 'release',
    releaseDate: '2020-04-10',
    clientUrl: '#',
    serverUrl: '#',
    description: 'Оптимізація',
    supportedLoaders: ['vanilla', 'forge'],
  },
  {
    id: '1.15.3',
    version: '1.15.3',
    type: 'release',
    releaseDate: '2020-03-15',
    clientUrl: '#',
    serverUrl: '#',
    description: 'Виправлення багів',
    supportedLoaders: ['vanilla', 'forge'],
  },
  {
    id: '1.15.2',
    version: '1.15.2',
    type: 'release',
    releaseDate: '2020-01-21',
    clientUrl: '#',
    serverUrl: '#',
    description: 'Стабільна версія Buzzy Bees',
    supportedLoaders: ['vanilla', 'forge'],
  },
  {
    id: '1.15.1',
    version: '1.15.1',
    type: 'release',
    releaseDate: '2019-12-17',
    clientUrl: '#',
    serverUrl: '#',
    description: 'Виправлення багів Buzzy Bees',
    supportedLoaders: ['vanilla', 'forge'],
  },
  {
    id: '1.15',
    version: '1.15',
    type: 'release',
    releaseDate: '2019-12-10',
    clientUrl: '#',
    serverUrl: '#',
    description: 'Buzzy Bees - бджоли та вулики',
    supportedLoaders: ['vanilla', 'forge'],
  },
  // 1.14.x versions
  {
    id: '1.14.5',
    version: '1.14.5',
    type: 'release',
    releaseDate: '2019-10-20',
    clientUrl: '#',
    serverUrl: '#',
    description: 'Фінальне оновлення 1.14',
    supportedLoaders: ['vanilla', 'forge'],
  },
  {
    id: '1.14.4',
    version: '1.14.4',
    type: 'release',
    releaseDate: '2019-07-19',
    clientUrl: '#',
    serverUrl: '#',
    description: 'Стабільна версія Village & Pillage',
    supportedLoaders: ['vanilla', 'forge'],
  },
  {
    id: '1.14.3',
    version: '1.14.3',
    type: 'release',
    releaseDate: '2019-06-24',
    clientUrl: '#',
    serverUrl: '#',
    description: 'Виправлення багів',
    supportedLoaders: ['vanilla', 'forge'],
  },
  {
    id: '1.14.2',
    version: '1.14.2',
    type: 'release',
    releaseDate: '2019-05-27',
    clientUrl: '#',
    serverUrl: '#',
    description: 'Виправлення багів',
    supportedLoaders: ['vanilla', 'forge'],
  },
  {
    id: '1.14.1',
    version: '1.14.1',
    type: 'release',
    releaseDate: '2019-05-13',
    clientUrl: '#',
    serverUrl: '#',
    description: 'Виправлення багів Village & Pillage',
    supportedLoaders: ['vanilla', 'forge'],
  },
  {
    id: '1.14',
    version: '1.14',
    type: 'release',
    releaseDate: '2019-04-23',
    clientUrl: '#',
    serverUrl: '#',
    description: 'Village & Pillage - села та рейди',
    supportedLoaders: ['vanilla', 'forge'],
  },
  // 1.13.x versions
  {
    id: '1.13.5',
    version: '1.13.5',
    type: 'release',
    releaseDate: '2019-02-20',
    clientUrl: '#',
    serverUrl: '#',
    description: 'Фінальне оновлення 1.13',
    supportedLoaders: ['vanilla', 'forge'],
  },
  {
    id: '1.13.4',
    version: '1.13.4',
    type: 'release',
    releaseDate: '2019-01-15',
    clientUrl: '#',
    serverUrl: '#',
    description: 'Оптимізація',
    supportedLoaders: ['vanilla', 'forge'],
  },
  {
    id: '1.13.3',
    version: '1.13.3',
    type: 'release',
    releaseDate: '2018-12-10',
    clientUrl: '#',
    serverUrl: '#',
    description: 'Виправлення багів',
    supportedLoaders: ['vanilla', 'forge'],
  },
  {
    id: '1.13.2',
    version: '1.13.2',
    type: 'release',
    releaseDate: '2018-10-22',
    clientUrl: '#',
    serverUrl: '#',
    description: 'Стабільна версія Update Aquatic',
    supportedLoaders: ['vanilla', 'forge'],
  },
  {
    id: '1.13.1',
    version: '1.13.1',
    type: 'release',
    releaseDate: '2018-08-22',
    clientUrl: '#',
    serverUrl: '#',
    description: 'Виправлення багів Update Aquatic',
    supportedLoaders: ['vanilla', 'forge'],
  },
  {
    id: '1.13',
    version: '1.13',
    type: 'release',
    releaseDate: '2018-07-18',
    clientUrl: '#',
    serverUrl: '#',
    description: 'Update Aquatic - океани та кораблі',
    supportedLoaders: ['vanilla', 'forge'],
  },
  // 1.12.x versions
  {
    id: '1.12.5',
    version: '1.12.5',
    type: 'release',
    releaseDate: '2018-02-20',
    clientUrl: '#',
    serverUrl: '#',
    description: 'Фінальне оновлення 1.12',
    supportedLoaders: ['vanilla', 'forge'],
  },
  {
    id: '1.12.4',
    version: '1.12.4',
    type: 'release',
    releaseDate: '2018-01-15',
    clientUrl: '#',
    serverUrl: '#',
    description: 'Оптимізація',
    supportedLoaders: ['vanilla', 'forge'],
  },
  {
    id: '1.12.3',
    version: '1.12.3',
    type: 'release',
    releaseDate: '2017-12-10',
    clientUrl: '#',
    serverUrl: '#',
    description: 'Виправлення багів',
    supportedLoaders: ['vanilla', 'forge'],
  },
  {
    id: '1.12.2',
    version: '1.12.2',
    type: 'release',
    releaseDate: '2017-09-18',
    clientUrl: '#',
    serverUrl: '#',
    description: 'Найпопулярніша версія для модів!',
    supportedLoaders: ['vanilla', 'forge'],
  },
  {
    id: '1.12.1',
    version: '1.12.1',
    type: 'release',
    releaseDate: '2017-08-03',
    clientUrl: '#',
    serverUrl: '#',
    description: 'Виправлення багів World of Color',
    supportedLoaders: ['vanilla', 'forge'],
  },
  {
    id: '1.12',
    version: '1.12',
    type: 'release',
    releaseDate: '2017-06-07',
    clientUrl: '#',
    serverUrl: '#',
    description: 'World of Color - бетон та попугаї',
    supportedLoaders: ['vanilla', 'forge'],
  },
  // 1.11.x versions
  {
    id: '1.11.5',
    version: '1.11.5',
    type: 'release',
    releaseDate: '2017-04-20',
    clientUrl: '#',
    serverUrl: '#',
    description: 'Фінальне оновлення 1.11',
    supportedLoaders: ['vanilla', 'forge'],
  },
  {
    id: '1.11.4',
    version: '1.11.4',
    type: 'release',
    releaseDate: '2017-03-15',
    clientUrl: '#',
    serverUrl: '#',
    description: 'Оптимізація',
    supportedLoaders: ['vanilla', 'forge'],
  },
  {
    id: '1.11.3',
    version: '1.11.3',
    type: 'release',
    releaseDate: '2017-02-10',
    clientUrl: '#',
    serverUrl: '#',
    description: 'Виправлення багів',
    supportedLoaders: ['vanilla', 'forge'],
  },
  {
    id: '1.11.2',
    version: '1.11.2',
    type: 'release',
    releaseDate: '2016-12-21',
    clientUrl: '#',
    serverUrl: '#',
    description: 'Стабільна версія Exploration Update',
    supportedLoaders: ['vanilla', 'forge'],
  },
  {
    id: '1.11.1',
    version: '1.11.1',
    type: 'release',
    releaseDate: '2016-12-20',
    clientUrl: '#',
    serverUrl: '#',
    description: 'Виправлення багів',
    supportedLoaders: ['vanilla', 'forge'],
  },
  {
    id: '1.11',
    version: '1.11',
    type: 'release',
    releaseDate: '2016-11-14',
    clientUrl: '#',
    serverUrl: '#',
    description: 'Exploration Update - маєтки та іллюзори',
    supportedLoaders: ['vanilla', 'forge'],
  },
  // 1.10.x versions
  {
    id: '1.10.5',
    version: '1.10.5',
    type: 'release',
    releaseDate: '2016-10-20',
    clientUrl: '#',
    serverUrl: '#',
    description: 'Фінальне оновлення 1.10',
    supportedLoaders: ['vanilla', 'forge'],
  },
  {
    id: '1.10.4',
    version: '1.10.4',
    type: 'release',
    releaseDate: '2016-09-15',
    clientUrl: '#',
    serverUrl: '#',
    description: 'Оптимізація',
    supportedLoaders: ['vanilla', 'forge'],
  },
  {
    id: '1.10.3',
    version: '1.10.3',
    type: 'release',
    releaseDate: '2016-08-20',
    clientUrl: '#',
    serverUrl: '#',
    description: 'Виправлення багів',
    supportedLoaders: ['vanilla', 'forge'],
  },
  {
    id: '1.10.2',
    version: '1.10.2',
    type: 'release',
    releaseDate: '2016-08-01',
    clientUrl: '#',
    serverUrl: '#',
    description: 'Стабільна версія Frostburn Update',
    supportedLoaders: ['vanilla', 'forge'],
  },
  {
    id: '1.10.1',
    version: '1.10.1',
    type: 'release',
    releaseDate: '2016-06-23',
    clientUrl: '#',
    serverUrl: '#',
    description: 'Виправлення багів',
    supportedLoaders: ['vanilla', 'forge'],
  },
  {
    id: '1.10',
    version: '1.10',
    type: 'release',
    releaseDate: '2016-06-08',
    clientUrl: '#',
    serverUrl: '#',
    description: 'Frostburn Update - полярні ведмеді',
    supportedLoaders: ['vanilla', 'forge'],
  },
  // 1.9.x versions
  {
    id: '1.9.5',
    version: '1.9.5',
    type: 'release',
    releaseDate: '2016-05-25',
    clientUrl: '#',
    serverUrl: '#',
    description: 'Фінальне оновлення 1.9',
    supportedLoaders: ['vanilla', 'forge'],
  },
  {
    id: '1.9.4',
    version: '1.9.4',
    type: 'release',
    releaseDate: '2016-05-10',
    clientUrl: '#',
    serverUrl: '#',
    description: 'Стабільна версія Combat Update',
    supportedLoaders: ['vanilla', 'forge'],
  },
  {
    id: '1.9.3',
    version: '1.9.3',
    type: 'release',
    releaseDate: '2016-05-10',
    clientUrl: '#',
    serverUrl: '#',
    description: 'Виправлення багів Combat Update',
    supportedLoaders: ['vanilla', 'forge'],
  },
  {
    id: '1.9.2',
    version: '1.9.2',
    type: 'release',
    releaseDate: '2016-03-30',
    clientUrl: '#',
    serverUrl: '#',
    description: 'Виправлення багів Combat Update',
    supportedLoaders: ['vanilla', 'forge'],
  },
  {
    id: '1.9.1',
    version: '1.9.1',
    type: 'release',
    releaseDate: '2016-03-30',
    clientUrl: '#',
    serverUrl: '#',
    description: 'Виправлення багів',
    supportedLoaders: ['vanilla', 'forge'],
  },
  {
    id: '1.9',
    version: '1.9',
    type: 'release',
    releaseDate: '2016-02-29',
    clientUrl: '#',
    serverUrl: '#',
    description: 'Combat Update - нова бойова система!',
    supportedLoaders: ['vanilla', 'forge'],
  },
  // 1.8.x versions
  {
    id: '1.8.5',
    version: '1.8.5',
    type: 'release',
    releaseDate: '2015-12-20',
    clientUrl: '#',
    serverUrl: '#',
    description: 'Фінальне оновлення 1.8',
    supportedLoaders: ['vanilla', 'forge'],
  },
  {
    id: '1.8.4',
    version: '1.8.4',
    type: 'release',
    releaseDate: '2015-11-15',
    clientUrl: '#',
    serverUrl: '#',
    description: 'Оптимізація',
    supportedLoaders: ['vanilla', 'forge'],
  },
  {
    id: '1.8.3',
    version: '1.8.3',
    type: 'release',
    releaseDate: '2015-10-10',
    clientUrl: '#',
    serverUrl: '#',
    description: 'Виправлення багів',
    supportedLoaders: ['vanilla', 'forge'],
  },
  {
    id: '1.8.2',
    version: '1.8.2',
    type: 'release',
    releaseDate: '2015-08-20',
    clientUrl: '#',
    serverUrl: '#',
    description: 'Виправлення багів',
    supportedLoaders: ['vanilla', 'forge'],
  },
  {
    id: '1.8.1',
    version: '1.8.1',
    type: 'release',
    releaseDate: '2015-06-15',
    clientUrl: '#',
    serverUrl: '#',
    description: 'Виправлення багів',
    supportedLoaders: ['vanilla', 'forge'],
  },
  {
    id: '1.8',
    version: '1.8',
    type: 'release',
    releaseDate: '2014-09-02',
    clientUrl: '#',
    serverUrl: '#',
    description: 'Bountiful Update - прапори та кролики',
    supportedLoaders: ['vanilla', 'forge'],
  },
  // 1.7.x versions
  {
    id: '1.7.5',
    version: '1.7.5',
    type: 'release',
    releaseDate: '2014-08-20',
    clientUrl: '#',
    serverUrl: '#',
    description: 'Фінальне оновлення 1.7',
    supportedLoaders: ['vanilla', 'forge'],
  },
  {
    id: '1.7.4',
    version: '1.7.4',
    type: 'release',
    releaseDate: '2014-07-15',
    clientUrl: '#',
    serverUrl: '#',
    description: 'Оптимізація',
    supportedLoaders: ['vanilla', 'forge'],
  },
  {
    id: '1.7.3',
    version: '1.7.3',
    type: 'release',
    releaseDate: '2014-07-01',
    clientUrl: '#',
    serverUrl: '#',
    description: 'Виправлення багів',
    supportedLoaders: ['vanilla', 'forge'],
  },
  {
    id: '1.7.2',
    version: '1.7.2',
    type: 'release',
    releaseDate: '2013-10-25',
    clientUrl: '#',
    serverUrl: '#',
    description: 'The Update that Changed the World',
    supportedLoaders: ['vanilla', 'forge'],
  },
  {
    id: '1.7.1',
    version: '1.7.1',
    type: 'release',
    releaseDate: '2013-10-01',
    clientUrl: '#',
    serverUrl: '#',
    description: 'Виправлення багів',
    supportedLoaders: ['vanilla', 'forge'],
  },
  {
    id: '1.7',
    version: '1.7',
    type: 'release',
    releaseDate: '2013-09-15',
    clientUrl: '#',
    serverUrl: '#',
    description: 'Початок 1.7 серії',
    supportedLoaders: ['vanilla', 'forge'],
  },
  // 1.6.x versions
  {
    id: '1.6.5',
    version: '1.6.5',
    type: 'release',
    releaseDate: '2013-09-25',
    clientUrl: '#',
    serverUrl: '#',
    description: 'Фінальне оновлення 1.6',
    supportedLoaders: ['vanilla', 'forge'],
  },
  {
    id: '1.6.4',
    version: '1.6.4',
    type: 'release',
    releaseDate: '2013-09-19',
    clientUrl: '#',
    serverUrl: '#',
    description: 'Horse Update - коні та ресурс паки',
    supportedLoaders: ['vanilla', 'forge'],
  },
  {
    id: '1.6.3',
    version: '1.6.3',
    type: 'release',
    releaseDate: '2013-09-01',
    clientUrl: '#',
    serverUrl: '#',
    description: 'Виправлення багів',
    supportedLoaders: ['vanilla', 'forge'],
  },
  {
    id: '1.6.2',
    version: '1.6.2',
    type: 'release',
    releaseDate: '2013-07-08',
    clientUrl: '#',
    serverUrl: '#',
    description: 'Виправлення багів',
    supportedLoaders: ['vanilla', 'forge'],
  },
  {
    id: '1.6.1',
    version: '1.6.1',
    type: 'release',
    releaseDate: '2013-07-01',
    clientUrl: '#',
    serverUrl: '#',
    description: 'Horse Update - перше оновлення',
    supportedLoaders: ['vanilla', 'forge'],
  },
  {
    id: '1.6',
    version: '1.6',
    type: 'release',
    releaseDate: '2013-06-15',
    clientUrl: '#',
    serverUrl: '#',
    description: 'Початок 1.6 серії',
    supportedLoaders: ['vanilla', 'forge'],
  },
  // 1.5.x versions
  {
    id: '1.5.5',
    version: '1.5.5',
    type: 'release',
    releaseDate: '2013-05-25',
    clientUrl: '#',
    serverUrl: '#',
    description: 'Фінальне оновлення 1.5',
    supportedLoaders: ['vanilla', 'forge'],
  },
  {
    id: '1.5.4',
    version: '1.5.4',
    type: 'release',
    releaseDate: '2013-05-20',
    clientUrl: '#',
    serverUrl: '#',
    description: 'Виправлення багів',
    supportedLoaders: ['vanilla', 'forge'],
  },
  {
    id: '1.5.3',
    version: '1.5.3',
    type: 'release',
    releaseDate: '2013-05-15',
    clientUrl: '#',
    serverUrl: '#',
    description: 'Виправлення багів',
    supportedLoaders: ['vanilla', 'forge'],
  },
  {
    id: '1.5.2',
    version: '1.5.2',
    type: 'release',
    releaseDate: '2013-05-02',
    clientUrl: '#',
    serverUrl: '#',
    description: 'Redstone Update - стабільна версія',
    supportedLoaders: ['vanilla', 'forge'],
  },
  {
    id: '1.5.1',
    version: '1.5.1',
    type: 'release',
    releaseDate: '2013-03-21',
    clientUrl: '#',
    serverUrl: '#',
    description: 'Виправлення багів Redstone Update',
    supportedLoaders: ['vanilla', 'forge'],
  },
  {
    id: '1.5',
    version: '1.5',
    type: 'release',
    releaseDate: '2013-03-13',
    clientUrl: '#',
    serverUrl: '#',
    description: 'Redstone Update - червоний камінь',
    supportedLoaders: ['vanilla', 'forge'],
  },
  // 1.4.x versions
  {
    id: '1.4.5',
    version: '1.4.5',
    type: 'release',
    releaseDate: '2013-01-20',
    clientUrl: '#',
    serverUrl: '#',
    description: 'Фінальне оновлення 1.4',
    supportedLoaders: ['vanilla'],
  },
  {
    id: '1.4.4',
    version: '1.4.4',
    type: 'release',
    releaseDate: '2013-01-15',
    clientUrl: '#',
    serverUrl: '#',
    description: 'Виправлення багів',
    supportedLoaders: ['vanilla'],
  },
  {
    id: '1.4.3',
    version: '1.4.3',
    type: 'release',
    releaseDate: '2013-01-10',
    clientUrl: '#',
    serverUrl: '#',
    description: 'Виправлення багів',
    supportedLoaders: ['vanilla'],
  },
  {
    id: '1.4.2',
    version: '1.4.2',
    type: 'release',
    releaseDate: '2012-12-30',
    clientUrl: '#',
    serverUrl: '#',
    description: 'Виправлення багів',
    supportedLoaders: ['vanilla'],
  },
  {
    id: '1.4.1',
    version: '1.4.1',
    type: 'release',
    releaseDate: '2012-12-29',
    clientUrl: '#',
    serverUrl: '#',
    description: 'Виправлення багів',
    supportedLoaders: ['vanilla'],
  },
  {
    id: '1.4',
    version: '1.4',
    type: 'release',
    releaseDate: '2012-10-25',
    clientUrl: '#',
    serverUrl: '#',
    description: 'Pretty Scary Update - відьми та боси',
    supportedLoaders: ['vanilla'],
  },
  // 1.3.x versions
  {
    id: '1.3.5',
    version: '1.3.5',
    type: 'release',
    releaseDate: '2012-09-20',
    clientUrl: '#',
    serverUrl: '#',
    description: 'Фінальне оновлення 1.3',
    supportedLoaders: ['vanilla'],
  },
  {
    id: '1.3.4',
    version: '1.3.4',
    type: 'release',
    releaseDate: '2012-09-15',
    clientUrl: '#',
    serverUrl: '#',
    description: 'Виправлення багів',
    supportedLoaders: ['vanilla'],
  },
  {
    id: '1.3.3',
    version: '1.3.3',
    type: 'release',
    releaseDate: '2012-09-10',
    clientUrl: '#',
    serverUrl: '#',
    description: 'Виправлення багів',
    supportedLoaders: ['vanilla'],
  },
  {
    id: '1.3.2',
    version: '1.3.2',
    type: 'release',
    releaseDate: '2012-08-16',
    clientUrl: '#',
    serverUrl: '#',
    description: 'Стабільна версія',
    supportedLoaders: ['vanilla'],
  },
  {
    id: '1.3.1',
    version: '1.3.1',
    type: 'release',
    releaseDate: '2012-08-01',
    clientUrl: '#',
    serverUrl: '#',
    description: 'Виправлення багів',
    supportedLoaders: ['vanilla'],
  },
  {
    id: '1.3',
    version: '1.3',
    type: 'release',
    releaseDate: '2012-07-15',
    clientUrl: '#',
    serverUrl: '#',
    description: 'Початок 1.3 серії',
    supportedLoaders: ['vanilla'],
  },
  // 1.2.x versions
  {
    id: '1.2.5',
    version: '1.2.5',
    type: 'release',
    releaseDate: '2012-04-04',
    clientUrl: '#',
    serverUrl: '#',
    description: 'Класична версія для старих серверів',
    supportedLoaders: ['vanilla'],
  },
  {
    id: '1.2.4',
    version: '1.2.4',
    type: 'release',
    releaseDate: '2012-03-25',
    clientUrl: '#',
    serverUrl: '#',
    description: 'Виправлення багів',
    supportedLoaders: ['vanilla'],
  },
  {
    id: '1.2.3',
    version: '1.2.3',
    type: 'release',
    releaseDate: '2012-03-20',
    clientUrl: '#',
    serverUrl: '#',
    description: 'Виправлення багів',
    supportedLoaders: ['vanilla'],
  },
  {
    id: '1.2.2',
    version: '1.2.2',
    type: 'release',
    releaseDate: '2012-03-15',
    clientUrl: '#',
    serverUrl: '#',
    description: 'Виправлення багів',
    supportedLoaders: ['vanilla'],
  },
  {
    id: '1.2.1',
    version: '1.2.1',
    type: 'release',
    releaseDate: '2012-03-01',
    clientUrl: '#',
    serverUrl: '#',
    description: 'Виправлення багів',
    supportedLoaders: ['vanilla'],
  },
  {
    id: '1.2',
    version: '1.2',
    type: 'release',
    releaseDate: '2012-02-15',
    clientUrl: '#',
    serverUrl: '#',
    description: 'Початок 1.2 серії',
    supportedLoaders: ['vanilla'],
  },
  // 1.1.x versions
  {
    id: '1.1.5',
    version: '1.1.5',
    type: 'release',
    releaseDate: '2012-02-10',
    clientUrl: '#',
    serverUrl: '#',
    description: 'Фінальне оновлення 1.1',
    supportedLoaders: ['vanilla'],
  },
  {
    id: '1.1.4',
    version: '1.1.4',
    type: 'release',
    releaseDate: '2012-02-05',
    clientUrl: '#',
    serverUrl: '#',
    description: 'Виправлення багів',
    supportedLoaders: ['vanilla'],
  },
  {
    id: '1.1.3',
    version: '1.1.3',
    type: 'release',
    releaseDate: '2012-02-01',
    clientUrl: '#',
    serverUrl: '#',
    description: 'Виправлення багів',
    supportedLoaders: ['vanilla'],
  },
  {
    id: '1.1.2',
    version: '1.1.2',
    type: 'release',
    releaseDate: '2012-01-25',
    clientUrl: '#',
    serverUrl: '#',
    description: 'Виправлення багів',
    supportedLoaders: ['vanilla'],
  },
  {
    id: '1.1.1',
    version: '1.1.1',
    type: 'release',
    releaseDate: '2012-01-20',
    clientUrl: '#',
    serverUrl: '#',
    description: 'Виправлення багів',
    supportedLoaders: ['vanilla'],
  },
  {
    id: '1.1',
    version: '1.1',
    type: 'release',
    releaseDate: '2012-01-12',
    clientUrl: '#',
    serverUrl: '#',
    description: 'Одна з перших релізних версій',
    supportedLoaders: ['vanilla'],
  },
  // Snapshots (тільки для клієнта) - 1.21+ Era (2024-2026)
  {
    id: '26w14a',
    version: '26w14a',
    type: 'snapshot',
    releaseDate: '2026-04-08',
    clientUrl: '#',
    serverUrl: '#',
    description: 'Снапшот 26 серії - експериментальні функції',
    supportedLoaders: ['vanilla', 'fabric'],
  },
  {
    id: '26w13a',
    version: '26w13a',
    type: 'snapshot',
    releaseDate: '2026-04-01',
    clientUrl: '#',
    serverUrl: '#',
    description: 'Снапшот 26 серії - експериментальні функції',
    supportedLoaders: ['vanilla', 'fabric'],
  },
  {
    id: '26w12a',
    version: '26w12a',
    type: 'snapshot',
    releaseDate: '2026-03-25',
    clientUrl: '#',
    serverUrl: '#',
    description: 'Снапшот 26 серії - експериментальні функції',
    supportedLoaders: ['vanilla', 'fabric'],
  },
  {
    id: '26w11a',
    version: '26w11a',
    type: 'snapshot',
    releaseDate: '2026-03-18',
    clientUrl: '#',
    serverUrl: '#',
    description: 'Снапшот 26 серії - експериментальні функції',
    supportedLoaders: ['vanilla', 'fabric'],
  },
  {
    id: '26w10a',
    version: '26w10a',
    type: 'snapshot',
    releaseDate: '2026-03-11',
    clientUrl: '#',
    serverUrl: '#',
    description: 'Снапшот 26 серії - експериментальні функції',
    supportedLoaders: ['vanilla', 'fabric'],
  },
  {
    id: '25w51a',
    version: '25w51a',
    type: 'snapshot',
    releaseDate: '2025-12-17',
    clientUrl: '#',
    serverUrl: '#',
    description: 'Снапшот 25 серії - нові функції',
    supportedLoaders: ['vanilla', 'fabric'],
  },
  {
    id: '25w50a',
    version: '25w50a',
    type: 'snapshot',
    releaseDate: '2025-12-10',
    clientUrl: '#',
    serverUrl: '#',
    description: 'Снапшот 25 серії - нові функції',
    supportedLoaders: ['vanilla', 'fabric'],
  },
  {
    id: '25w49a',
    version: '25w49a',
    type: 'snapshot',
    releaseDate: '2025-12-03',
    clientUrl: '#',
    serverUrl: '#',
    description: 'Снапшот 25 серії - нові функції',
    supportedLoaders: ['vanilla', 'fabric'],
  },
  {
    id: '25w48a',
    version: '25w48a',
    type: 'snapshot',
    releaseDate: '2025-11-26',
    clientUrl: '#',
    serverUrl: '#',
    description: 'Снапшот 25 серії - нові функції',
    supportedLoaders: ['vanilla', 'fabric'],
  },
  {
    id: '25w47a',
    version: '25w47a',
    type: 'snapshot',
    releaseDate: '2025-11-19',
    clientUrl: '#',
    serverUrl: '#',
    description: 'Снапшот 25 серії - нові функції',
    supportedLoaders: ['vanilla', 'fabric'],
  },
  {
    id: '25w46a',
    version: '25w46a',
    type: 'snapshot',
    releaseDate: '2025-11-12',
    clientUrl: '#',
    serverUrl: '#',
    description: 'Снапшот 25 серії - нові функції',
    supportedLoaders: ['vanilla', 'fabric'],
  },
  {
    id: '25w45a',
    version: '25w45a',
    type: 'snapshot',
    releaseDate: '2025-11-05',
    clientUrl: '#',
    serverUrl: '#',
    description: 'Снапшот 25 серії - нові функції',
    supportedLoaders: ['vanilla', 'fabric'],
  },
  {
    id: '25w44a',
    version: '25w44a',
    type: 'snapshot',
    releaseDate: '2025-10-29',
    clientUrl: '#',
    serverUrl: '#',
    description: 'Снапшот 25 серії - нові функції',
    supportedLoaders: ['vanilla', 'fabric'],
  },
  {
    id: '25w43a',
    version: '25w43a',
    type: 'snapshot',
    releaseDate: '2025-10-22',
    clientUrl: '#',
    serverUrl: '#',
    description: 'Снапшот 25 серії - нові функції',
    supportedLoaders: ['vanilla', 'fabric'],
  },
  {
    id: '25w42a',
    version: '25w42a',
    type: 'snapshot',
    releaseDate: '2025-10-15',
    clientUrl: '#',
    serverUrl: '#',
    description: 'Снапшот 25 серії - нові функції',
    supportedLoaders: ['vanilla', 'fabric'],
  },
  {
    id: '25w41a',
    version: '25w41a',
    type: 'snapshot',
    releaseDate: '2025-10-08',
    clientUrl: '#',
    serverUrl: '#',
    description: 'Снапшот 25 серії - нові функції',
    supportedLoaders: ['vanilla', 'fabric'],
  },
  {
    id: '25w40a',
    version: '25w40a',
    type: 'snapshot',
    releaseDate: '2025-10-01',
    clientUrl: '#',
    serverUrl: '#',
    description: 'Снапшот 25 серії - нові функції',
    supportedLoaders: ['vanilla', 'fabric'],
  },
  {
    id: '24w46a',
    version: '24w46a',
    type: 'snapshot',
    releaseDate: '2024-11-13',
    clientUrl: '#',
    serverUrl: '#',
    description: 'Снапшот 1.21 серії',
    supportedLoaders: ['vanilla', 'fabric'],
  },
  {
    id: '24w45a',
    version: '24w45a',
    type: 'snapshot',
    releaseDate: '2024-11-06',
    clientUrl: '#',
    serverUrl: '#',
    description: 'Снапшот 1.21 серії',
    supportedLoaders: ['vanilla', 'fabric'],
  },
  {
    id: '24w44a',
    version: '24w44a',
    type: 'snapshot',
    releaseDate: '2024-10-30',
    clientUrl: '#',
    serverUrl: '#',
    description: 'Снапшот 1.21 серії',
    supportedLoaders: ['vanilla', 'fabric'],
  },
  {
    id: '24w43a',
    version: '24w43a',
    type: 'snapshot',
    releaseDate: '2024-10-23',
    clientUrl: '#',
    serverUrl: '#',
    description: 'Снапшот 1.21 серії',
    supportedLoaders: ['vanilla', 'fabric'],
  },
  {
    id: '24w42a',
    version: '24w42a',
    type: 'snapshot',
    releaseDate: '2024-10-16',
    clientUrl: '#',
    serverUrl: '#',
    description: 'Снапшот 1.21 серії',
    supportedLoaders: ['vanilla', 'fabric'],
  },
  {
    id: '24w41a',
    version: '24w41a',
    type: 'snapshot',
    releaseDate: '2024-10-09',
    clientUrl: '#',
    serverUrl: '#',
    description: 'Снапшот 1.21 серії',
    supportedLoaders: ['vanilla', 'fabric'],
  },
  {
    id: '24w40a',
    version: '24w40a',
    type: 'snapshot',
    releaseDate: '2024-10-02',
    clientUrl: '#',
    serverUrl: '#',
    description: 'Снапшот 1.21 серії',
    supportedLoaders: ['vanilla', 'fabric'],
  },
  {
    id: '24w39a',
    version: '24w39a',
    type: 'snapshot',
    releaseDate: '2024-09-25',
    clientUrl: '#',
    serverUrl: '#',
    description: 'Снапшот 1.21 серії',
    supportedLoaders: ['vanilla', 'fabric'],
  },
  {
    id: '24w38a',
    version: '24w38a',
    type: 'snapshot',
    releaseDate: '2024-09-18',
    clientUrl: '#',
    serverUrl: '#',
    description: 'Снапшот 1.21 серії',
    supportedLoaders: ['vanilla', 'fabric'],
  },
  {
    id: '24w37a',
    version: '24w37a',
    type: 'snapshot',
    releaseDate: '2024-09-11',
    clientUrl: '#',
    serverUrl: '#',
    description: 'Снапшот 1.21 серії',
    supportedLoaders: ['vanilla', 'fabric'],
  },
  {
    id: '24w36a',
    version: '24w36a',
    type: 'snapshot',
    releaseDate: '2024-09-04',
    clientUrl: '#',
    serverUrl: '#',
    description: 'Снапшот 1.21 серії',
    supportedLoaders: ['vanilla', 'fabric'],
  },
  {
    id: '24w35a',
    version: '24w35a',
    type: 'snapshot',
    releaseDate: '2024-08-28',
    clientUrl: '#',
    serverUrl: '#',
    description: 'Снапшот 1.21 серії',
    supportedLoaders: ['vanilla', 'fabric'],
  },
  {
    id: '24w34a',
    version: '24w34a',
    type: 'snapshot',
    releaseDate: '2024-08-21',
    clientUrl: '#',
    serverUrl: '#',
    description: 'Снапшот 1.21 серії',
    supportedLoaders: ['vanilla', 'fabric'],
  },
  {
    id: '24w33a',
    version: '24w33a',
    type: 'snapshot',
    releaseDate: '2024-08-14',
    clientUrl: '#',
    serverUrl: '#',
    description: 'Снапшот 1.21 серії',
    supportedLoaders: ['vanilla', 'fabric'],
  },
  {
    id: '24w32a',
    version: '24w32a',
    type: 'snapshot',
    releaseDate: '2024-08-07',
    clientUrl: '#',
    serverUrl: '#',
    description: 'Снапшот 1.21 серії',
    supportedLoaders: ['vanilla', 'fabric'],
  },
  {
    id: '24w31a',
    version: '24w31a',
    type: 'snapshot',
    releaseDate: '2024-07-31',
    clientUrl: '#',
    serverUrl: '#',
    description: 'Снапшот 1.21 серії',
    supportedLoaders: ['vanilla', 'fabric'],
  },
  {
    id: '24w30a',
    version: '24w30a',
    type: 'snapshot',
    releaseDate: '2024-07-24',
    clientUrl: '#',
    serverUrl: '#',
    description: 'Снапшот 1.21 серії',
    supportedLoaders: ['vanilla', 'fabric'],
  },
  {
    id: '24w29a',
    version: '24w29a',
    type: 'snapshot',
    releaseDate: '2024-07-17',
    clientUrl: '#',
    serverUrl: '#',
    description: 'Снапшот 1.21 серії',
    supportedLoaders: ['vanilla', 'fabric'],
  },
  {
    id: '24w28a',
    version: '24w28a',
    type: 'snapshot',
    releaseDate: '2024-07-10',
    clientUrl: '#',
    serverUrl: '#',
    description: 'Снапшот 1.21 серії',
    supportedLoaders: ['vanilla', 'fabric'],
  },
  {
    id: '24w27a',
    version: '24w27a',
    type: 'snapshot',
    releaseDate: '2024-07-03',
    clientUrl: '#',
    serverUrl: '#',
    description: 'Снапшот 1.21 серії',
    supportedLoaders: ['vanilla', 'fabric'],
  },
  {
    id: '24w26a',
    version: '24w26a',
    type: 'snapshot',
    releaseDate: '2024-06-26',
    clientUrl: '#',
    serverUrl: '#',
    description: 'Снапшот 1.21 серії',
    supportedLoaders: ['vanilla', 'fabric'],
  },
  {
    id: '24w25a',
    version: '24w25a',
    type: 'snapshot',
    releaseDate: '2024-06-19',
    clientUrl: '#',
    serverUrl: '#',
    description: 'Снапшот 1.21 серії',
    supportedLoaders: ['vanilla', 'fabric'],
  },
  {
    id: '24w24a',
    version: '24w24a',
    type: 'snapshot',
    releaseDate: '2024-06-12',
    clientUrl: '#',
    serverUrl: '#',
    description: 'Снапшот 1.21 серії',
    supportedLoaders: ['vanilla', 'fabric'],
  },
  {
    id: '24w23a',
    version: '24w23a',
    type: 'snapshot',
    releaseDate: '2024-06-05',
    clientUrl: '#',
    serverUrl: '#',
    description: 'Снапшот 1.21 серії',
    supportedLoaders: ['vanilla', 'fabric'],
  },
  {
    id: '24w22a',
    version: '24w22a',
    type: 'snapshot',
    releaseDate: '2024-05-29',
    clientUrl: '#',
    serverUrl: '#',
    description: 'Снапшот 1.21 серії',
    supportedLoaders: ['vanilla', 'fabric'],
  },
  {
    id: '24w21a',
    version: '24w21a',
    type: 'snapshot',
    releaseDate: '2024-05-22',
    clientUrl: '#',
    serverUrl: '#',
    description: 'Снапшот 1.21 серії',
    supportedLoaders: ['vanilla', 'fabric'],
  },
  {
    id: '24w20a',
    version: '24w20a',
    type: 'snapshot',
    releaseDate: '2024-05-15',
    clientUrl: '#',
    serverUrl: '#',
    description: 'Снапшот 1.21 серії',
    supportedLoaders: ['vanilla', 'fabric'],
  },
  {
    id: '24w19a',
    version: '24w19a',
    type: 'snapshot',
    releaseDate: '2024-05-08',
    clientUrl: '#',
    serverUrl: '#',
    description: 'Снапшот 1.21 серії',
    supportedLoaders: ['vanilla', 'fabric'],
  },
  {
    id: '24w18a',
    version: '24w18a',
    type: 'snapshot',
    releaseDate: '2024-05-01',
    clientUrl: '#',
    serverUrl: '#',
    description: 'Снапшот 1.21 серії',
    supportedLoaders: ['vanilla', 'fabric'],
  },
  {
    id: '24w17a',
    version: '24w17a',
    type: 'snapshot',
    releaseDate: '2024-04-24',
    clientUrl: '#',
    serverUrl: '#',
    description: 'Снапшот 1.21 серії',
    supportedLoaders: ['vanilla', 'fabric'],
  },
  {
    id: '24w16a',
    version: '24w16a',
    type: 'snapshot',
    releaseDate: '2024-04-17',
    clientUrl: '#',
    serverUrl: '#',
    description: 'Снапшот 1.21 серії',
    supportedLoaders: ['vanilla', 'fabric'],
  },
  {
    id: '24w15a',
    version: '24w15a',
    type: 'snapshot',
    releaseDate: '2024-04-10',
    clientUrl: '#',
    serverUrl: '#',
    description: 'Снапшот 1.21 серії',
    supportedLoaders: ['vanilla', 'fabric'],
  },
  {
    id: '24w14a',
    version: '24w14a',
    type: 'snapshot',
    releaseDate: '2024-04-03',
    clientUrl: '#',
    serverUrl: '#',
    description: 'Снапшот 1.21 серії',
    supportedLoaders: ['vanilla', 'fabric'],
  },
  {
    id: '24w13a',
    version: '24w13a',
    type: 'snapshot',
    releaseDate: '2024-03-27',
    clientUrl: '#',
    serverUrl: '#',
    description: 'Снапшот 1.21 серії',
    supportedLoaders: ['vanilla', 'fabric'],
  },
  {
    id: '24w12a',
    version: '24w12a',
    type: 'snapshot',
    releaseDate: '2024-03-20',
    clientUrl: '#',
    serverUrl: '#',
    description: 'Снапшот 1.21 серії',
    supportedLoaders: ['vanilla', 'fabric'],
  },
  {
    id: '24w11a',
    version: '24w11a',
    type: 'snapshot',
    releaseDate: '2024-03-13',
    clientUrl: '#',
    serverUrl: '#',
    description: 'Снапшот 1.21 серії',
    supportedLoaders: ['vanilla', 'fabric'],
  },
  {
    id: '24w10a',
    version: '24w10a',
    type: 'snapshot',
    releaseDate: '2024-03-06',
    clientUrl: '#',
    serverUrl: '#',
    description: 'Снапшот 1.21 серії',
    supportedLoaders: ['vanilla', 'fabric'],
  },
  {
    id: '24w09a',
    version: '24w09a',
    type: 'snapshot',
    releaseDate: '2024-02-28',
    clientUrl: '#',
    serverUrl: '#',
    description: 'Снапшот 1.21 серії',
    supportedLoaders: ['vanilla', 'fabric'],
  },
  {
    id: '24w08a',
    version: '24w08a',
    type: 'snapshot',
    releaseDate: '2024-02-21',
    clientUrl: '#',
    serverUrl: '#',
    description: 'Снапшот 1.21 серії',
    supportedLoaders: ['vanilla', 'fabric'],
  },
  {
    id: '24w07a',
    version: '24w07a',
    type: 'snapshot',
    releaseDate: '2024-02-14',
    clientUrl: '#',
    serverUrl: '#',
    description: 'Снапшот 1.21 серії',
    supportedLoaders: ['vanilla', 'fabric'],
  },
  {
    id: '24w06a',
    version: '24w06a',
    type: 'snapshot',
    releaseDate: '2024-02-07',
    clientUrl: '#',
    serverUrl: '#',
    description: 'Снапшот 1.21 серії',
    supportedLoaders: ['vanilla', 'fabric'],
  },
  {
    id: '24w05a',
    version: '24w05a',
    type: 'snapshot',
    releaseDate: '2024-01-31',
    clientUrl: '#',
    serverUrl: '#',
    description: 'Снапшот 1.21 серії',
    supportedLoaders: ['vanilla', 'fabric'],
  },
  {
    id: '24w04a',
    version: '24w04a',
    type: 'snapshot',
    releaseDate: '2024-01-24',
    clientUrl: '#',
    serverUrl: '#',
    description: 'Снапшот 1.21 серії',
    supportedLoaders: ['vanilla', 'fabric'],
  },
  {
    id: '24w03a',
    version: '24w03a',
    type: 'snapshot',
    releaseDate: '2024-01-17',
    clientUrl: '#',
    serverUrl: '#',
    description: 'Снапшот 1.21 серії',
    supportedLoaders: ['vanilla', 'fabric'],
  },
  // 1.19-1.20 Era Snapshots (2022-2023)
  {
    id: '23w51b',
    version: '23w51b',
    type: 'snapshot',
    releaseDate: '2023-12-21',
    clientUrl: '#',
    serverUrl: '#',
    description: 'Снапшот 1.20 серії',
    supportedLoaders: ['vanilla', 'fabric'],
  },
  {
    id: '23w51a',
    version: '23w51a',
    type: 'snapshot',
    releaseDate: '2023-12-20',
    clientUrl: '#',
    serverUrl: '#',
    description: 'Снапшот 1.20 серії',
    supportedLoaders: ['vanilla', 'fabric'],
  },
  {
    id: '23w46a',
    version: '23w46a',
    type: 'snapshot',
    releaseDate: '2023-11-15',
    clientUrl: '#',
    serverUrl: '#',
    description: 'Снапшот 1.20 серії',
    supportedLoaders: ['vanilla', 'fabric'],
  },
  {
    id: '23w45a',
    version: '23w45a',
    type: 'snapshot',
    releaseDate: '2023-11-08',
    clientUrl: '#',
    serverUrl: '#',
    description: 'Снапшот 1.20 серії',
    supportedLoaders: ['vanilla', 'fabric'],
  },
  {
    id: '23w44a',
    version: '23w44a',
    type: 'snapshot',
    releaseDate: '2023-11-01',
    clientUrl: '#',
    serverUrl: '#',
    description: 'Снапшот 1.20 серії',
    supportedLoaders: ['vanilla', 'fabric'],
  },
  {
    id: '23w43a',
    version: '23w43a',
    type: 'snapshot',
    releaseDate: '2023-10-25',
    clientUrl: '#',
    serverUrl: '#',
    description: 'Снапшот 1.20 серії',
    supportedLoaders: ['vanilla', 'fabric'],
  },
  {
    id: '23w42a',
    version: '23w42a',
    type: 'snapshot',
    releaseDate: '2023-10-18',
    clientUrl: '#',
    serverUrl: '#',
    description: 'Снапшот 1.20 серії',
    supportedLoaders: ['vanilla', 'fabric'],
  },
  {
    id: '23w41a',
    version: '23w41a',
    type: 'snapshot',
    releaseDate: '2023-10-11',
    clientUrl: '#',
    serverUrl: '#',
    description: 'Снапшот 1.20 серії',
    supportedLoaders: ['vanilla', 'fabric'],
  },
  {
    id: '23w40a',
    version: '23w40a',
    type: 'snapshot',
    releaseDate: '2023-10-04',
    clientUrl: '#',
    serverUrl: '#',
    description: 'Снапшот 1.20 серії',
    supportedLoaders: ['vanilla', 'fabric'],
  },
  {
    id: '22w44a',
    version: '22w44a',
    type: 'snapshot',
    releaseDate: '2022-11-02',
    clientUrl: '#',
    serverUrl: '#',
    description: 'Снапшот 1.19 серії',
    supportedLoaders: ['vanilla', 'fabric'],
  },
  {
    id: '22w43a',
    version: '22w43a',
    type: 'snapshot',
    releaseDate: '2022-10-26',
    clientUrl: '#',
    serverUrl: '#',
    description: 'Снапшот 1.19 серії',
    supportedLoaders: ['vanilla', 'fabric'],
  },
  {
    id: '22w42a',
    version: '22w42a',
    type: 'snapshot',
    releaseDate: '2022-10-19',
    clientUrl: '#',
    serverUrl: '#',
    description: 'Снапшот 1.19 серії',
    supportedLoaders: ['vanilla', 'fabric'],
  },
  {
    id: '22w03a',
    version: '22w03a',
    type: 'snapshot',
    releaseDate: '2022-01-19',
    clientUrl: '#',
    serverUrl: '#',
    description: 'Снапшот 1.18 серії',
    supportedLoaders: ['vanilla', 'fabric'],
  },
  // 1.17-1.18 Era Snapshots (2020-2021)
  {
    id: '21w44a',
    version: '21w44a',
    type: 'snapshot',
    releaseDate: '2021-11-03',
    clientUrl: '#',
    serverUrl: '#',
    description: 'Снапшот 1.18 серії',
    supportedLoaders: ['vanilla', 'fabric'],
  },
  {
    id: '21w43a',
    version: '21w43a',
    type: 'snapshot',
    releaseDate: '2021-10-27',
    clientUrl: '#',
    serverUrl: '#',
    description: 'Снапшот 1.18 серії',
    supportedLoaders: ['vanilla', 'fabric'],
  },
  {
    id: '21w42a',
    version: '21w42a',
    type: 'snapshot',
    releaseDate: '2021-10-20',
    clientUrl: '#',
    serverUrl: '#',
    description: 'Снапшот 1.18 серії',
    supportedLoaders: ['vanilla', 'fabric'],
  },
  {
    id: '21w41a',
    version: '21w41a',
    type: 'snapshot',
    releaseDate: '2021-10-13',
    clientUrl: '#',
    serverUrl: '#',
    description: 'Снапшот 1.18 серії',
    supportedLoaders: ['vanilla', 'fabric'],
  },
  {
    id: '21w40a',
    version: '21w40a',
    type: 'snapshot',
    releaseDate: '2021-10-06',
    clientUrl: '#',
    serverUrl: '#',
    description: 'Снапшот 1.18 серії',
    supportedLoaders: ['vanilla', 'fabric'],
  },
  {
    id: '21w39a',
    version: '21w39a',
    type: 'snapshot',
    releaseDate: '2021-09-29',
    clientUrl: '#',
    serverUrl: '#',
    description: 'Снапшот 1.18 серії',
    supportedLoaders: ['vanilla', 'fabric'],
  },
  {
    id: '21w38a',
    version: '21w38a',
    type: 'snapshot',
    releaseDate: '2021-09-22',
    clientUrl: '#',
    serverUrl: '#',
    description: 'Снапшот 1.18 серії',
    supportedLoaders: ['vanilla', 'fabric'],
  },
  {
    id: '21w37a',
    version: '21w37a',
    type: 'snapshot',
    releaseDate: '2021-09-15',
    clientUrl: '#',
    serverUrl: '#',
    description: 'Снапшот 1.18 серії',
    supportedLoaders: ['vanilla', 'fabric'],
  },
  {
    id: '21w14a',
    version: '21w14a',
    type: 'snapshot',
    releaseDate: '2021-04-07',
    clientUrl: '#',
    serverUrl: '#',
    description: 'Снапшот 1.17 серії',
    supportedLoaders: ['vanilla', 'fabric'],
  },
  {
    id: '21w13a',
    version: '21w13a',
    type: 'snapshot',
    releaseDate: '2021-03-31',
    clientUrl: '#',
    serverUrl: '#',
    description: 'Снапшот 1.17 серії',
    supportedLoaders: ['vanilla', 'fabric'],
  },
  {
    id: '21w11a',
    version: '21w11a',
    type: 'snapshot',
    releaseDate: '2021-03-17',
    clientUrl: '#',
    serverUrl: '#',
    description: 'Снапшот 1.17 серії',
    supportedLoaders: ['vanilla', 'fabric'],
  },
  {
    id: '21w10a',
    version: '21w10a',
    type: 'snapshot',
    releaseDate: '2021-03-10',
    clientUrl: '#',
    serverUrl: '#',
    description: 'Снапшот 1.17 серії',
    supportedLoaders: ['vanilla', 'fabric'],
  },
  {
    id: '21w09a',
    version: '21w09a',
    type: 'snapshot',
    releaseDate: '2021-03-03',
    clientUrl: '#',
    serverUrl: '#',
    description: 'Снапшот 1.17 серії',
    supportedLoaders: ['vanilla', 'fabric'],
  },
  {
    id: '21w08a',
    version: '21w08a',
    type: 'snapshot',
    releaseDate: '2021-02-24',
    clientUrl: '#',
    serverUrl: '#',
    description: 'Снапшот 1.17 серії',
    supportedLoaders: ['vanilla', 'fabric'],
  },
  {
    id: '21w07a',
    version: '21w07a',
    type: 'snapshot',
    releaseDate: '2021-02-17',
    clientUrl: '#',
    serverUrl: '#',
    description: 'Снапшот 1.17 серії',
    supportedLoaders: ['vanilla', 'fabric'],
  },
  {
    id: '21w06a',
    version: '21w06a',
    type: 'snapshot',
    releaseDate: '2021-02-10',
    clientUrl: '#',
    serverUrl: '#',
    description: 'Снапшот 1.17 серії',
    supportedLoaders: ['vanilla', 'fabric'],
  },
  {
    id: '21w05a',
    version: '21w05a',
    type: 'snapshot',
    releaseDate: '2021-02-03',
    clientUrl: '#',
    serverUrl: '#',
    description: 'Снапшот 1.17 серії',
    supportedLoaders: ['vanilla', 'fabric'],
  },
  {
    id: '21w03a',
    version: '21w03a',
    type: 'snapshot',
    releaseDate: '2021-01-20',
    clientUrl: '#',
    serverUrl: '#',
    description: 'Снапшот 1.17 серії',
    supportedLoaders: ['vanilla', 'fabric'],
  },
  // 1.16 Era Snapshots (2020)
  {
    id: '20w51a',
    version: '20w51a',
    type: 'snapshot',
    releaseDate: '2020-12-16',
    clientUrl: '#',
    serverUrl: '#',
    description: 'Снапшот 1.16 серії',
    supportedLoaders: ['vanilla'],
  },
  {
    id: '20w50a',
    version: '20w50a',
    type: 'snapshot',
    releaseDate: '2020-12-09',
    clientUrl: '#',
    serverUrl: '#',
    description: 'Снапшот 1.16 серії',
    supportedLoaders: ['vanilla'],
  },
  {
    id: '20w49a',
    version: '20w49a',
    type: 'snapshot',
    releaseDate: '2020-12-02',
    clientUrl: '#',
    serverUrl: '#',
    description: 'Снапшот 1.16 серії',
    supportedLoaders: ['vanilla'],
  },
  {
    id: '20w48a',
    version: '20w48a',
    type: 'snapshot',
    releaseDate: '2020-11-25',
    clientUrl: '#',
    serverUrl: '#',
    description: 'Снапшот 1.16 серії',
    supportedLoaders: ['vanilla'],
  },
  {
    id: '20w46a',
    version: '20w46a',
    type: 'snapshot',
    releaseDate: '2020-11-11',
    clientUrl: '#',
    serverUrl: '#',
    description: 'Снапшот 1.16 серії',
    supportedLoaders: ['vanilla'],
  },
  {
    id: '20w45a',
    version: '20w45a',
    type: 'snapshot',
    releaseDate: '2020-11-04',
    clientUrl: '#',
    serverUrl: '#',
    description: 'Снапшот 1.16 серії',
    supportedLoaders: ['vanilla'],
  },
  {
    id: '20w29a',
    version: '20w29a',
    type: 'snapshot',
    releaseDate: '2020-07-15',
    clientUrl: '#',
    serverUrl: '#',
    description: 'Снапшот 1.16 серії',
    supportedLoaders: ['vanilla'],
  },
  {
    id: '20w28a',
    version: '20w28a',
    type: 'snapshot',
    releaseDate: '2020-07-08',
    clientUrl: '#',
    serverUrl: '#',
    description: 'Снапшот 1.16 серії',
    supportedLoaders: ['vanilla'],
  },
  {
    id: '20w27a',
    version: '20w27a',
    type: 'snapshot',
    releaseDate: '2020-07-01',
    clientUrl: '#',
    serverUrl: '#',
    description: 'Снапшот 1.16 серії',
    supportedLoaders: ['vanilla'],
  },
  {
    id: '20w26a',
    version: '20w26a',
    type: 'snapshot',
    releaseDate: '2020-06-24',
    clientUrl: '#',
    serverUrl: '#',
    description: 'Снапшот 1.16 серії',
    supportedLoaders: ['vanilla'],
  },
  {
    id: '20w25a',
    version: '20w25a',
    type: 'snapshot',
    releaseDate: '2020-06-17',
    clientUrl: '#',
    serverUrl: '#',
    description: 'Снапшот 1.16 серії',
    supportedLoaders: ['vanilla'],
  },
  {
    id: '20w24a',
    version: '20w24a',
    type: 'snapshot',
    releaseDate: '2020-06-10',
    clientUrl: '#',
    serverUrl: '#',
    description: 'Снапшот 1.16 серії',
    supportedLoaders: ['vanilla'],
  },
  {
    id: '20w23a',
    version: '20w23a',
    type: 'snapshot',
    releaseDate: '2020-06-03',
    clientUrl: '#',
    serverUrl: '#',
    description: 'Снапшот 1.16 серії',
    supportedLoaders: ['vanilla'],
  },
  {
    id: '20w22a',
    version: '20w22a',
    type: 'snapshot',
    releaseDate: '2020-05-27',
    clientUrl: '#',
    serverUrl: '#',
    description: 'Снапшот 1.16 серії',
    supportedLoaders: ['vanilla'],
  },
  {
    id: '20w21a',
    version: '20w21a',
    type: 'snapshot',
    releaseDate: '2020-05-20',
    clientUrl: '#',
    serverUrl: '#',
    description: 'Снапшот 1.16 серії',
    supportedLoaders: ['vanilla'],
  },
  {
    id: '20w20a',
    version: '20w20a',
    type: 'snapshot',
    releaseDate: '2020-05-13',
    clientUrl: '#',
    serverUrl: '#',
    description: 'Снапшот 1.16 серії',
    supportedLoaders: ['vanilla'],
  },
  {
    id: '20w19a',
    version: '20w19a',
    type: 'snapshot',
    releaseDate: '2020-05-06',
    clientUrl: '#',
    serverUrl: '#',
    description: 'Снапшот 1.16 серії',
    supportedLoaders: ['vanilla'],
  },
  {
    id: '20w18a',
    version: '20w18a',
    type: 'snapshot',
    releaseDate: '2020-04-29',
    clientUrl: '#',
    serverUrl: '#',
    description: 'Снапшот 1.16 серії',
    supportedLoaders: ['vanilla'],
  },
  {
    id: '20w17a',
    version: '20w17a',
    type: 'snapshot',
    releaseDate: '2020-04-22',
    clientUrl: '#',
    serverUrl: '#',
    description: 'Снапшот 1.16 серії',
    supportedLoaders: ['vanilla'],
  },
  {
    id: '20w16a',
    version: '20w16a',
    type: 'snapshot',
    releaseDate: '2020-04-15',
    clientUrl: '#',
    serverUrl: '#',
    description: 'Снапшот 1.16 серії',
    supportedLoaders: ['vanilla'],
  },
  {
    id: '20w15a',
    version: '20w15a',
    type: 'snapshot',
    releaseDate: '2020-04-08',
    clientUrl: '#',
    serverUrl: '#',
    description: 'Снапшот 1.16 серії',
    supportedLoaders: ['vanilla'],
  },
  {
    id: '20w14a',
    version: '20w14a',
    type: 'snapshot',
    releaseDate: '2020-04-01',
    clientUrl: '#',
    serverUrl: '#',
    description: 'Снапшот 1.16 серії',
    supportedLoaders: ['vanilla'],
  },
  {
    id: '20w13a',
    version: '20w13a',
    type: 'snapshot',
    releaseDate: '2020-03-25',
    clientUrl: '#',
    serverUrl: '#',
    description: 'Снапшот 1.16 серії',
    supportedLoaders: ['vanilla'],
  },
  {
    id: '20w12a',
    version: '20w12a',
    type: 'snapshot',
    releaseDate: '2020-03-18',
    clientUrl: '#',
    serverUrl: '#',
    description: 'Снапшот 1.16 серії',
    supportedLoaders: ['vanilla'],
  },
  {
    id: '20w11a',
    version: '20w11a',
    type: 'snapshot',
    releaseDate: '2020-03-11',
    clientUrl: '#',
    serverUrl: '#',
    description: 'Снапшот 1.16 серії',
    supportedLoaders: ['vanilla'],
  },
  {
    id: '20w10a',
    version: '20w10a',
    type: 'snapshot',
    releaseDate: '2020-03-04',
    clientUrl: '#',
    serverUrl: '#',
    description: 'Снапшот 1.16 серії',
    supportedLoaders: ['vanilla'],
  },
  {
    id: '20w09a',
    version: '20w09a',
    type: 'snapshot',
    releaseDate: '2020-02-26',
    clientUrl: '#',
    serverUrl: '#',
    description: 'Снапшот 1.16 серії',
    supportedLoaders: ['vanilla'],
  },
  {
    id: '20w08a',
    version: '20w08a',
    type: 'snapshot',
    releaseDate: '2020-02-19',
    clientUrl: '#',
    serverUrl: '#',
    description: 'Снапшот 1.16 серії',
    supportedLoaders: ['vanilla'],
  },
  {
    id: '20w07a',
    version: '20w07a',
    type: 'snapshot',
    releaseDate: '2020-02-12',
    clientUrl: '#',
    serverUrl: '#',
    description: 'Снапшот 1.16 серії',
    supportedLoaders: ['vanilla'],
  },
  {
    id: '20w06a',
    version: '20w06a',
    type: 'snapshot',
    releaseDate: '2020-02-05',
    clientUrl: '#',
    serverUrl: '#',
    description: 'Снапшот 1.16 серії',
    supportedLoaders: ['vanilla'],
  },
  // 1.13-1.15 Era Snapshots (2018-2019)
  {
    id: '19w46b',
    version: '19w46b',
    type: 'snapshot',
    releaseDate: '2019-11-15',
    clientUrl: '#',
    serverUrl: '#',
    description: 'Снапшот 1.15 серії',
    supportedLoaders: ['vanilla'],
  },
  {
    id: '19w46a',
    version: '19w46a',
    type: 'snapshot',
    releaseDate: '2019-11-14',
    clientUrl: '#',
    serverUrl: '#',
    description: 'Снапшот 1.15 серії',
    supportedLoaders: ['vanilla'],
  },
  {
    id: '19w45a',
    version: '19w45a',
    type: 'snapshot',
    releaseDate: '2019-11-07',
    clientUrl: '#',
    serverUrl: '#',
    description: 'Снапшот 1.15 серії',
    supportedLoaders: ['vanilla'],
  },
  {
    id: '19w44a',
    version: '19w44a',
    type: 'snapshot',
    releaseDate: '2019-10-30',
    clientUrl: '#',
    serverUrl: '#',
    description: 'Снапшот 1.15 серії',
    supportedLoaders: ['vanilla'],
  },
  {
    id: '19w42a',
    version: '19w42a',
    type: 'snapshot',
    releaseDate: '2019-10-16',
    clientUrl: '#',
    serverUrl: '#',
    description: 'Снапшот 1.15 серії',
    supportedLoaders: ['vanilla'],
  },
  {
    id: '19w41a',
    version: '19w41a',
    type: 'snapshot',
    releaseDate: '2019-10-09',
    clientUrl: '#',
    serverUrl: '#',
    description: 'Снапшот 1.15 серії',
    supportedLoaders: ['vanilla'],
  },
  {
    id: '19w40a',
    version: '19w40a',
    type: 'snapshot',
    releaseDate: '2019-10-02',
    clientUrl: '#',
    serverUrl: '#',
    description: 'Снапшот 1.15 серії',
    supportedLoaders: ['vanilla'],
  },
  {
    id: '19w39a',
    version: '19w39a',
    type: 'snapshot',
    releaseDate: '2019-09-25',
    clientUrl: '#',
    serverUrl: '#',
    description: 'Снапшот 1.15 серії',
    supportedLoaders: ['vanilla'],
  },
  {
    id: '19w38a',
    version: '19w38a',
    type: 'snapshot',
    releaseDate: '2019-09-18',
    clientUrl: '#',
    serverUrl: '#',
    description: 'Снапшот 1.15 серії',
    supportedLoaders: ['vanilla'],
  },
  {
    id: '19w37a',
    version: '19w37a',
    type: 'snapshot',
    releaseDate: '2019-09-11',
    clientUrl: '#',
    serverUrl: '#',
    description: 'Снапшот 1.15 серії',
    supportedLoaders: ['vanilla'],
  },
  {
    id: '19w36a',
    version: '19w36a',
    type: 'snapshot',
    releaseDate: '2019-09-04',
    clientUrl: '#',
    serverUrl: '#',
    description: 'Снапшот 1.15 серії',
    supportedLoaders: ['vanilla'],
  },
  {
    id: '19w35a',
    version: '19w35a',
    type: 'snapshot',
    releaseDate: '2019-08-28',
    clientUrl: '#',
    serverUrl: '#',
    description: 'Снапшот 1.15 серії',
    supportedLoaders: ['vanilla'],
  },
  {
    id: '19w34a',
    version: '19w34a',
    type: 'snapshot',
    releaseDate: '2019-08-21',
    clientUrl: '#',
    serverUrl: '#',
    description: 'Снапшот 1.15 серії',
    supportedLoaders: ['vanilla'],
  },
  {
    id: '19w14b',
    version: '19w14b',
    type: 'snapshot',
    releaseDate: '2019-04-05',
    clientUrl: '#',
    serverUrl: '#',
    description: 'Снапшот 1.14 серії',
    supportedLoaders: ['vanilla'],
  },
  {
    id: '19w14a',
    version: '19w14a',
    type: 'snapshot',
    releaseDate: '2019-04-03',
    clientUrl: '#',
    serverUrl: '#',
    description: 'Снапшот 1.14 серії',
    supportedLoaders: ['vanilla'],
  },
  {
    id: '19w13b',
    version: '19w13b',
    type: 'snapshot',
    releaseDate: '2019-03-29',
    clientUrl: '#',
    serverUrl: '#',
    description: 'Снапшот 1.14 серії',
    supportedLoaders: ['vanilla'],
  },
  {
    id: '19w13a',
    version: '19w13a',
    type: 'snapshot',
    releaseDate: '2019-03-27',
    clientUrl: '#',
    serverUrl: '#',
    description: 'Снапшот 1.14 серії',
    supportedLoaders: ['vanilla'],
  },
  {
    id: '19w12b',
    version: '19w12b',
    type: 'snapshot',
    releaseDate: '2019-03-22',
    clientUrl: '#',
    serverUrl: '#',
    description: 'Снапшот 1.14 серії',
    supportedLoaders: ['vanilla'],
  },
  {
    id: '19w12a',
    version: '19w12a',
    type: 'snapshot',
    releaseDate: '2019-03-20',
    clientUrl: '#',
    serverUrl: '#',
    description: 'Снапшот 1.14 серії',
    supportedLoaders: ['vanilla'],
  },
  {
    id: '19w11b',
    version: '19w11b',
    type: 'snapshot',
    releaseDate: '2019-03-15',
    clientUrl: '#',
    serverUrl: '#',
    description: 'Снапшот 1.14 серії',
    supportedLoaders: ['vanilla'],
  },
  {
    id: '19w11a',
    version: '19w11a',
    type: 'snapshot',
    releaseDate: '2019-03-13',
    clientUrl: '#',
    serverUrl: '#',
    description: 'Снапшот 1.14 серії',
    supportedLoaders: ['vanilla'],
  },
  {
    id: '19w09a',
    version: '19w09a',
    type: 'snapshot',
    releaseDate: '2019-02-27',
    clientUrl: '#',
    serverUrl: '#',
    description: 'Снапшот 1.14 серії',
    supportedLoaders: ['vanilla'],
  },
  {
    id: '19w08b',
    version: '19w08b',
    type: 'snapshot',
    releaseDate: '2019-02-22',
    clientUrl: '#',
    serverUrl: '#',
    description: 'Снапшот 1.14 серії',
    supportedLoaders: ['vanilla'],
  },
  {
    id: '19w08a',
    version: '19w08a',
    type: 'snapshot',
    releaseDate: '2019-02-20',
    clientUrl: '#',
    serverUrl: '#',
    description: 'Снапшот 1.14 серії',
    supportedLoaders: ['vanilla'],
  },
  {
    id: '19w07a',
    version: '19w07a',
    type: 'snapshot',
    releaseDate: '2019-02-13',
    clientUrl: '#',
    serverUrl: '#',
    description: 'Снапшот 1.14 серії',
    supportedLoaders: ['vanilla'],
  },
  {
    id: '19w06a',
    version: '19w06a',
    type: 'snapshot',
    releaseDate: '2019-02-06',
    clientUrl: '#',
    serverUrl: '#',
    description: 'Снапшот 1.14 серії',
    supportedLoaders: ['vanilla'],
  },
  {
    id: '19w05a',
    version: '19w05a',
    type: 'snapshot',
    releaseDate: '2019-01-30',
    clientUrl: '#',
    serverUrl: '#',
    description: 'Снапшот 1.14 серії',
    supportedLoaders: ['vanilla'],
  },
  {
    id: '19w04b',
    version: '19w04b',
    type: 'snapshot',
    releaseDate: '2019-01-25',
    clientUrl: '#',
    serverUrl: '#',
    description: 'Снапшот 1.14 серії',
    supportedLoaders: ['vanilla'],
  },
  {
    id: '19w04a',
    version: '19w04a',
    type: 'snapshot',
    releaseDate: '2019-01-23',
    clientUrl: '#',
    serverUrl: '#',
    description: 'Снапшот 1.14 серії',
    supportedLoaders: ['vanilla'],
  },
  {
    id: '19w03c',
    version: '19w03c',
    type: 'snapshot',
    releaseDate: '2019-01-18',
    clientUrl: '#',
    serverUrl: '#',
    description: 'Снапшот 1.14 серії',
    supportedLoaders: ['vanilla'],
  },
  {
    id: '19w03b',
    version: '19w03b',
    type: 'snapshot',
    releaseDate: '2019-01-17',
    clientUrl: '#',
    serverUrl: '#',
    description: 'Снапшот 1.14 серії',
    supportedLoaders: ['vanilla'],
  },
  {
    id: '19w03a',
    version: '19w03a',
    type: 'snapshot',
    releaseDate: '2019-01-16',
    clientUrl: '#',
    serverUrl: '#',
    description: 'Снапшот 1.14 серії',
    supportedLoaders: ['vanilla'],
  },
  {
    id: '19w02a',
    version: '19w02a',
    type: 'snapshot',
    releaseDate: '2019-01-09',
    clientUrl: '#',
    serverUrl: '#',
    description: 'Снапшот 1.14 серії',
    supportedLoaders: ['vanilla'],
  },
  {
    id: '18w50a',
    version: '18w50a',
    type: 'snapshot',
    releaseDate: '2018-12-12',
    clientUrl: '#',
    serverUrl: '#',
    description: 'Снапшот 1.14 серії',
    supportedLoaders: ['vanilla'],
  },
  {
    id: '18w49a',
    version: '18w49a',
    type: 'snapshot',
    releaseDate: '2018-12-05',
    clientUrl: '#',
    serverUrl: '#',
    description: 'Снапшот 1.14 серії',
    supportedLoaders: ['vanilla'],
  },
  {
    id: '18w48a',
    version: '18w48a',
    type: 'snapshot',
    releaseDate: '2018-11-28',
    clientUrl: '#',
    serverUrl: '#',
    description: 'Снапшот 1.14 серії',
    supportedLoaders: ['vanilla'],
  },
  {
    id: '18w47a',
    version: '18w47a',
    type: 'snapshot',
    releaseDate: '2018-11-21',
    clientUrl: '#',
    serverUrl: '#',
    description: 'Снапшот 1.14 серії',
    supportedLoaders: ['vanilla'],
  },
  {
    id: '18w46a',
    version: '18w46a',
    type: 'snapshot',
    releaseDate: '2018-11-14',
    clientUrl: '#',
    serverUrl: '#',
    description: 'Снапшот 1.14 серії',
    supportedLoaders: ['vanilla'],
  },
  {
    id: '18w45a',
    version: '18w45a',
    type: 'snapshot',
    releaseDate: '2018-11-07',
    clientUrl: '#',
    serverUrl: '#',
    description: 'Снапшот 1.14 серії',
    supportedLoaders: ['vanilla'],
  },
  {
    id: '18w44a',
    version: '18w44a',
    type: 'snapshot',
    releaseDate: '2018-10-31',
    clientUrl: '#',
    serverUrl: '#',
    description: 'Снапшот 1.14 серії',
    supportedLoaders: ['vanilla'],
  },
  {
    id: '18w43a',
    version: '18w43a',
    type: 'snapshot',
    releaseDate: '2018-10-24',
    clientUrl: '#',
    serverUrl: '#',
    description: 'Снапшот 1.14 серії',
    supportedLoaders: ['vanilla'],
  },
  {
    id: '18w33a',
    version: '18w33a',
    type: 'snapshot',
    releaseDate: '2018-08-15',
    clientUrl: '#',
    serverUrl: '#',
    description: 'Снапшот 1.14 серії',
    supportedLoaders: ['vanilla'],
  },
  {
    id: '18w32a',
    version: '18w32a',
    type: 'snapshot',
    releaseDate: '2018-08-08',
    clientUrl: '#',
    serverUrl: '#',
    description: 'Снапшот 1.14 серії',
    supportedLoaders: ['vanilla'],
  },
  {
    id: '18w31a',
    version: '18w31a',
    type: 'snapshot',
    releaseDate: '2018-08-01',
    clientUrl: '#',
    serverUrl: '#',
    description: 'Снапшот 1.14 серії',
    supportedLoaders: ['vanilla'],
  },
  {
    id: '18w30a',
    version: '18w30a',
    type: 'snapshot',
    releaseDate: '2018-07-25',
    clientUrl: '#',
    serverUrl: '#',
    description: 'Снапшот 1.14 серії',
    supportedLoaders: ['vanilla'],
  },
  {
    id: '18w22c',
    version: '18w22c',
    type: 'snapshot',
    releaseDate: '2018-06-01',
    clientUrl: '#',
    serverUrl: '#',
    description: 'Снапшот 1.13 серії',
    supportedLoaders: ['vanilla'],
  },
  {
    id: '18w22b',
    version: '18w22b',
    type: 'snapshot',
    releaseDate: '2018-05-30',
    clientUrl: '#',
    serverUrl: '#',
    description: 'Снапшот 1.13 серії',
    supportedLoaders: ['vanilla'],
  },
  {
    id: '18w22a',
    version: '18w22a',
    type: 'snapshot',
    releaseDate: '2018-05-29',
    clientUrl: '#',
    serverUrl: '#',
    description: 'Снапшот 1.13 серії',
    supportedLoaders: ['vanilla'],
  },
  {
    id: '18w21b',
    version: '18w21b',
    type: 'snapshot',
    releaseDate: '2018-05-25',
    clientUrl: '#',
    serverUrl: '#',
    description: 'Снапшот 1.13 серії',
    supportedLoaders: ['vanilla'],
  },
  {
    id: '18w21a',
    version: '18w21a',
    type: 'snapshot',
    releaseDate: '2018-05-24',
    clientUrl: '#',
    serverUrl: '#',
    description: 'Снапшот 1.13 серії',
    supportedLoaders: ['vanilla'],
  },
  {
    id: '18w20b',
    version: '18w20b',
    type: 'snapshot',
    releaseDate: '2018-05-18',
    clientUrl: '#',
    serverUrl: '#',
    description: 'Снапшот 1.13 серії',
    supportedLoaders: ['vanilla'],
  },
  {
    id: '18w20a',
    version: '18w20a',
    type: 'snapshot',
    releaseDate: '2018-05-16',
    clientUrl: '#',
    serverUrl: '#',
    description: 'Снапшот 1.13 серії',
    supportedLoaders: ['vanilla'],
  },
  {
    id: '18w19a',
    version: '18w19a',
    type: 'snapshot',
    releaseDate: '2018-05-09',
    clientUrl: '#',
    serverUrl: '#',
    description: 'Снапшот 1.13 серії',
    supportedLoaders: ['vanilla'],
  },
  {
    id: '18w16a',
    version: '18w16a',
    type: 'snapshot',
    releaseDate: '2018-04-18',
    clientUrl: '#',
    serverUrl: '#',
    description: 'Снапшот 1.13 серії',
    supportedLoaders: ['vanilla'],
  },
  {
    id: '18w15a',
    version: '18w15a',
    type: 'snapshot',
    releaseDate: '2018-04-11',
    clientUrl: '#',
    serverUrl: '#',
    description: 'Снапшот 1.13 серії',
    supportedLoaders: ['vanilla'],
  },
  {
    id: '18w14b',
    version: '18w14b',
    type: 'snapshot',
    releaseDate: '2018-04-06',
    clientUrl: '#',
    serverUrl: '#',
    description: 'Снапшот 1.13 серії',
    supportedLoaders: ['vanilla'],
  },
  {
    id: '18w14a',
    version: '18w14a',
    type: 'snapshot',
    releaseDate: '2018-04-04',
    clientUrl: '#',
    serverUrl: '#',
    description: 'Снапшот 1.13 серії',
    supportedLoaders: ['vanilla'],
  },
  {
    id: '18w11a',
    version: '18w11a',
    type: 'snapshot',
    releaseDate: '2018-03-14',
    clientUrl: '#',
    serverUrl: '#',
    description: 'Снапшот 1.13 серії',
    supportedLoaders: ['vanilla'],
  },
  {
    id: '18w10d',
    version: '18w10d',
    type: 'snapshot',
    releaseDate: '2018-03-09',
    clientUrl: '#',
    serverUrl: '#',
    description: 'Снапшот 1.13 серії',
    supportedLoaders: ['vanilla'],
  },
  {
    id: '18w10c',
    version: '18w10c',
    type: 'snapshot',
    releaseDate: '2018-03-08',
    clientUrl: '#',
    serverUrl: '#',
    description: 'Снапшот 1.13 серії',
    supportedLoaders: ['vanilla'],
  },
  {
    id: '18w10b',
    version: '18w10b',
    type: 'snapshot',
    releaseDate: '2018-03-07',
    clientUrl: '#',
    serverUrl: '#',
    description: 'Снапшот 1.13 серії',
    supportedLoaders: ['vanilla'],
  },
  {
    id: '18w10a',
    version: '18w10a',
    type: 'snapshot',
    releaseDate: '2018-03-06',
    clientUrl: '#',
    serverUrl: '#',
    description: 'Снапшот 1.13 серії',
    supportedLoaders: ['vanilla'],
  },
  {
    id: '18w09a',
    version: '18w09a',
    type: 'snapshot',
    releaseDate: '2018-02-28',
    clientUrl: '#',
    serverUrl: '#',
    description: 'Снапшот 1.13 серії',
    supportedLoaders: ['vanilla'],
  },
  {
    id: '18w08b',
    version: '18w08b',
    type: 'snapshot',
    releaseDate: '2018-02-23',
    clientUrl: '#',
    serverUrl: '#',
    description: 'Снапшот 1.13 серії',
    supportedLoaders: ['vanilla'],
  },
  {
    id: '18w08a',
    version: '18w08a',
    type: 'snapshot',
    releaseDate: '2018-02-22',
    clientUrl: '#',
    serverUrl: '#',
    description: 'Снапшот 1.13 серії',
    supportedLoaders: ['vanilla'],
  },
  {
    id: '18w07a',
    version: '18w07a',
    type: 'snapshot',
    releaseDate: '2018-02-14',
    clientUrl: '#',
    serverUrl: '#',
    description: 'Снапшот 1.13 серії',
    supportedLoaders: ['vanilla'],
  },
  {
    id: '18w06a',
    version: '18w06a',
    type: 'snapshot',
    releaseDate: '2018-02-07',
    clientUrl: '#',
    serverUrl: '#',
    description: 'Снапшот 1.13 серії',
    supportedLoaders: ['vanilla'],
  },
  {
    id: '18w05a',
    version: '18w05a',
    type: 'snapshot',
    releaseDate: '2018-01-31',
    clientUrl: '#',
    serverUrl: '#',
    description: 'Снапшот 1.13 серії',
    supportedLoaders: ['vanilla'],
  },
  {
    id: '18w03b',
    version: '18w03b',
    type: 'snapshot',
    releaseDate: '2018-01-19',
    clientUrl: '#',
    serverUrl: '#',
    description: 'Снапшот 1.13 серії',
    supportedLoaders: ['vanilla'],
  },
  {
    id: '18w03a',
    version: '18w03a',
    type: 'snapshot',
    releaseDate: '2018-01-17',
    clientUrl: '#',
    serverUrl: '#',
    description: 'Снапшот 1.13 серії',
    supportedLoaders: ['vanilla'],
  },
  {
    id: '18w02a',
    version: '18w02a',
    type: 'snapshot',
    releaseDate: '2018-01-10',
    clientUrl: '#',
    serverUrl: '#',
    description: 'Снапшот 1.13 серії',
    supportedLoaders: ['vanilla'],
  },
  {
    id: '18w01a',
    version: '18w01a',
    type: 'snapshot',
    releaseDate: '2018-01-03',
    clientUrl: '#',
    serverUrl: '#',
    description: 'Снапшот 1.13 серії',
    supportedLoaders: ['vanilla'],
  },
  // Older Snapshots (2016-2017)
  {
    id: '17w50a',
    version: '17w50a',
    type: 'snapshot',
    releaseDate: '2017-12-13',
    clientUrl: '#',
    serverUrl: '#',
    description: 'Снапшот 1.13 серії',
    supportedLoaders: ['vanilla'],
  },
  {
    id: '17w49a',
    version: '17w49a',
    type: 'snapshot',
    releaseDate: '2017-12-06',
    clientUrl: '#',
    serverUrl: '#',
    description: 'Снапшот 1.13 серії',
    supportedLoaders: ['vanilla'],
  },
  {
    id: '17w47a',
    version: '17w47a',
    type: 'snapshot',
    releaseDate: '2017-11-22',
    clientUrl: '#',
    serverUrl: '#',
    description: 'Снапшот 1.13 серії',
    supportedLoaders: ['vanilla'],
  },
  {
    id: '17w46a',
    version: '17w46a',
    type: 'snapshot',
    releaseDate: '2017-11-15',
    clientUrl: '#',
    serverUrl: '#',
    description: 'Снапшот 1.13 серії',
    supportedLoaders: ['vanilla'],
  },
  {
    id: '17w45a',
    version: '17w45a',
    type: 'snapshot',
    releaseDate: '2017-11-08',
    clientUrl: '#',
    serverUrl: '#',
    description: 'Снапшот 1.13 серії',
    supportedLoaders: ['vanilla'],
  },
  {
    id: '17w43a',
    version: '17w43a',
    type: 'snapshot',
    releaseDate: '2017-10-25',
    clientUrl: '#',
    serverUrl: '#',
    description: 'Снапшот 1.13 серії',
    supportedLoaders: ['vanilla'],
  },
  {
    id: '17w31a',
    version: '17w31a',
    type: 'snapshot',
    releaseDate: '2017-08-02',
    clientUrl: '#',
    serverUrl: '#',
    description: 'Снапшот 1.12 серії',
    supportedLoaders: ['vanilla'],
  },
  {
    id: '17w18b',
    version: '17w18b',
    type: 'snapshot',
    releaseDate: '2017-05-05',
    clientUrl: '#',
    serverUrl: '#',
    description: 'Снапшот 1.12 серії',
    supportedLoaders: ['vanilla'],
  },
  {
    id: '17w18a',
    version: '17w18a',
    type: 'snapshot',
    releaseDate: '2017-05-04',
    clientUrl: '#',
    serverUrl: '#',
    description: 'Снапшот 1.12 серії',
    supportedLoaders: ['vanilla'],
  },
  {
    id: '17w17b',
    version: '17w17b',
    type: 'snapshot',
    releaseDate: '2017-04-28',
    clientUrl: '#',
    serverUrl: '#',
    description: 'Снапшот 1.12 серії',
    supportedLoaders: ['vanilla'],
  },
  {
    id: '17w17a',
    version: '17w17a',
    type: 'snapshot',
    releaseDate: '2017-04-26',
    clientUrl: '#',
    serverUrl: '#',
    description: 'Снапшот 1.12 серії',
    supportedLoaders: ['vanilla'],
  },
  {
    id: '17w16a',
    version: '17w16a',
    type: 'snapshot',
    releaseDate: '2017-04-19',
    clientUrl: '#',
    serverUrl: '#',
    description: 'Снапшот 1.12 серії',
    supportedLoaders: ['vanilla'],
  },
  {
    id: '17w15a',
    version: '17w15a',
    type: 'snapshot',
    releaseDate: '2017-04-12',
    clientUrl: '#',
    serverUrl: '#',
    description: 'Снапшот 1.12 серії',
    supportedLoaders: ['vanilla'],
  },
  {
    id: '17w14a',
    version: '17w14a',
    type: 'snapshot',
    releaseDate: '2017-04-05',
    clientUrl: '#',
    serverUrl: '#',
    description: 'Снапшот 1.12 серії',
    supportedLoaders: ['vanilla'],
  },
  {
    id: '17w13a',
    version: '17w13a',
    type: 'snapshot',
    releaseDate: '2017-03-29',
    clientUrl: '#',
    serverUrl: '#',
    description: 'Снапшот 1.12 серії',
    supportedLoaders: ['vanilla'],
  },
  {
    id: '17w06a',
    version: '17w06a',
    type: 'snapshot',
    releaseDate: '2017-02-08',
    clientUrl: '#',
    serverUrl: '#',
    description: 'Снапшот 1.12 серії',
    supportedLoaders: ['vanilla'],
  },
  {
    id: '16w50a',
    version: '16w50a',
    type: 'snapshot',
    releaseDate: '2016-12-14',
    clientUrl: '#',
    serverUrl: '#',
    description: 'Снапшот 1.11 серії',
    supportedLoaders: ['vanilla'],
  },
  {
    id: '16w44a',
    version: '16w44a',
    type: 'snapshot',
    releaseDate: '2016-11-02',
    clientUrl: '#',
    serverUrl: '#',
    description: 'Снапшот 1.11 серії',
    supportedLoaders: ['vanilla'],
  },
  {
    id: '16w43a',
    version: '16w43a',
    type: 'snapshot',
    releaseDate: '2016-10-26',
    clientUrl: '#',
    serverUrl: '#',
    description: 'Снапшот 1.11 серії',
    supportedLoaders: ['vanilla'],
  },
  {
    id: '16w42a',
    version: '16w42a',
    type: 'snapshot',
    releaseDate: '2016-10-19',
    clientUrl: '#',
    serverUrl: '#',
    description: 'Снапшот 1.11 серії',
    supportedLoaders: ['vanilla'],
  },
  {
    id: '16w41a',
    version: '16w41a',
    type: 'snapshot',
    releaseDate: '2016-10-12',
    clientUrl: '#',
    serverUrl: '#',
    description: 'Снапшот 1.11 серії',
    supportedLoaders: ['vanilla'],
  },
  {
    id: '16w40a',
    version: '16w40a',
    type: 'snapshot',
    releaseDate: '2016-10-05',
    clientUrl: '#',
    serverUrl: '#',
    description: 'Снапшот 1.11 серії',
    supportedLoaders: ['vanilla'],
  },
  {
    id: '16w39a',
    version: '16w39a',
    type: 'snapshot',
    releaseDate: '2016-09-28',
    clientUrl: '#',
    serverUrl: '#',
    description: 'Снапшот 1.11 серії',
    supportedLoaders: ['vanilla'],
  },
  {
    id: '16w38a',
    version: '16w38a',
    type: 'snapshot',
    releaseDate: '2016-09-21',
    clientUrl: '#',
    serverUrl: '#',
    description: 'Снапшот 1.11 серії',
    supportedLoaders: ['vanilla'],
  },
  {
    id: '16w36a',
    version: '16w36a',
    type: 'snapshot',
    releaseDate: '2016-09-07',
    clientUrl: '#',
    serverUrl: '#',
    description: 'Снапшот 1.11 серії',
    supportedLoaders: ['vanilla'],
  },
  {
    id: '16w35a',
    version: '16w35a',
    type: 'snapshot',
    releaseDate: '2016-08-31',
    clientUrl: '#',
    serverUrl: '#',
    description: 'Снапшот 1.11 серії',
    supportedLoaders: ['vanilla'],
  },
  {
    id: '16w33a',
    version: '16w33a',
    type: 'snapshot',
    releaseDate: '2016-08-17',
    clientUrl: '#',
    serverUrl: '#',
    description: 'Снапшот 1.11 серії',
    supportedLoaders: ['vanilla'],
  },
  {
    id: '16w32a',
    version: '16w32a',
    type: 'snapshot',
    releaseDate: '2016-08-10',
    clientUrl: '#',
    serverUrl: '#',
    description: 'Снапшот 1.11 серії',
    supportedLoaders: ['vanilla'],
  },
  {
    id: '16w30a',
    version: '16w30a',
    type: 'snapshot',
    releaseDate: '2016-07-27',
    clientUrl: '#',
    serverUrl: '#',
    description: 'Снапшот 1.11 серії',
    supportedLoaders: ['vanilla'],
  },
  {
    id: '16w21b',
    version: '16w21b',
    type: 'snapshot',
    releaseDate: '2016-05-27',
    clientUrl: '#',
    serverUrl: '#',
    description: 'Снапшот 1.10 серії',
    supportedLoaders: ['vanilla'],
  },
  {
    id: '16w21a',
    version: '16w21a',
    type: 'snapshot',
    releaseDate: '2016-05-26',
    clientUrl: '#',
    serverUrl: '#',
    description: 'Снапшот 1.10 серії',
    supportedLoaders: ['vanilla'],
  },
  {
    id: '16w20a',
    version: '16w20a',
    type: 'snapshot',
    releaseDate: '2016-05-18',
    clientUrl: '#',
    serverUrl: '#',
    description: 'Снапшот 1.10 серії',
    supportedLoaders: ['vanilla'],
  },
  {
    id: '16w15a',
    version: '16w15a',
    type: 'snapshot',
    releaseDate: '2016-04-13',
    clientUrl: '#',
    serverUrl: '#',
    description: 'Снапшот 1.10 серії',
    supportedLoaders: ['vanilla'],
  },
  {
    id: '16w14a',
    version: '16w14a',
    type: 'snapshot',
    releaseDate: '2016-04-06',
    clientUrl: '#',
    serverUrl: '#',
    description: 'Снапшот 1.10 серії',
    supportedLoaders: ['vanilla'],
  },
  {
    id: '16w09a',
    version: '16w09a',
    type: 'snapshot',
    releaseDate: '2016-03-02',
    clientUrl: '#',
    serverUrl: '#',
    description: 'Снапшот 1.9 серії',
    supportedLoaders: ['vanilla'],
  },
  {
    id: '16w08a',
    version: '16w08a',
    type: 'snapshot',
    releaseDate: '2016-02-24',
    clientUrl: '#',
    serverUrl: '#',
    description: 'Снапшот 1.9 серії',
    supportedLoaders: ['vanilla'],
  },
  {
    id: '16w07a',
    version: '16w07a',
    type: 'snapshot',
    releaseDate: '2016-02-17',
    clientUrl: '#',
    serverUrl: '#',
    description: 'Снапшот 1.9 серії',
    supportedLoaders: ['vanilla'],
  },
  {
    id: '16w06a',
    version: '16w06a',
    type: 'snapshot',
    releaseDate: '2016-02-10',
    clientUrl: '#',
    serverUrl: '#',
    description: 'Снапшот 1.9 серії',
    supportedLoaders: ['vanilla'],
  },
  {
    id: '16w05a',
    version: '16w05a',
    type: 'snapshot',
    releaseDate: '2016-02-03',
    clientUrl: '#',
    serverUrl: '#',
    description: 'Снапшот 1.9 серії',
    supportedLoaders: ['vanilla'],
  },
  {
    id: '16w04a',
    version: '16w04a',
    type: 'snapshot',
    releaseDate: '2016-01-27',
    clientUrl: '#',
    serverUrl: '#',
    description: 'Снапшот 1.9 серії',
    supportedLoaders: ['vanilla'],
  },
  {
    id: '16w03a',
    version: '16w03a',
    type: 'snapshot',
    releaseDate: '2016-01-20',
    clientUrl: '#',
    serverUrl: '#',
    description: 'Снапшот 1.9 серії',
    supportedLoaders: ['vanilla'],
  },
  {
    id: '16w02a',
    version: '16w02a',
    type: 'snapshot',
    releaseDate: '2016-01-13',
    clientUrl: '#',
    serverUrl: '#',
    description: 'Снапшот 1.9 серії',
    supportedLoaders: ['vanilla'],
  },
  // 1.8-1.9 Era Snapshots (2015)
  {
    id: '15w51b',
    version: '15w51b',
    type: 'snapshot',
    releaseDate: '2015-12-21',
    clientUrl: '#',
    serverUrl: '#',
    description: 'Снапшот 1.9 серії',
    supportedLoaders: ['vanilla'],
  },
  {
    id: '15w51a',
    version: '15w51a',
    type: 'snapshot',
    releaseDate: '2015-12-18',
    clientUrl: '#',
    serverUrl: '#',
    description: 'Снапшот 1.9 серії',
    supportedLoaders: ['vanilla'],
  },
  {
    id: '15w50a',
    version: '15w50a',
    type: 'snapshot',
    releaseDate: '2015-12-16',
    clientUrl: '#',
    serverUrl: '#',
    description: 'Снапшот 1.9 серії',
    supportedLoaders: ['vanilla'],
  },
  {
    id: '15w49a',
    version: '15w49a',
    type: 'snapshot',
    releaseDate: '2015-12-02',
    clientUrl: '#',
    serverUrl: '#',
    description: 'Снапшот 1.9 серії',
    supportedLoaders: ['vanilla'],
  },
  {
    id: '15w47a',
    version: '15w47a',
    type: 'snapshot',
    releaseDate: '2015-11-18',
    clientUrl: '#',
    serverUrl: '#',
    description: 'Снапшот 1.9 серії',
    supportedLoaders: ['vanilla'],
  },
  {
    id: '15w46a',
    version: '15w46a',
    type: 'snapshot',
    releaseDate: '2015-11-11',
    clientUrl: '#',
    serverUrl: '#',
    description: 'Снапшот 1.9 серії',
    supportedLoaders: ['vanilla'],
  },
  {
    id: '15w45a',
    version: '15w45a',
    type: 'snapshot',
    releaseDate: '2015-11-04',
    clientUrl: '#',
    serverUrl: '#',
    description: 'Снапшот 1.9 серії',
    supportedLoaders: ['vanilla'],
  },
  {
    id: '15w44a',
    version: '15w44a',
    type: 'snapshot',
    releaseDate: '2015-10-28',
    clientUrl: '#',
    serverUrl: '#',
    description: 'Снапшот 1.9 серії',
    supportedLoaders: ['vanilla'],
  },
  {
    id: '15w43a',
    version: '15w43a',
    type: 'snapshot',
    releaseDate: '2015-10-21',
    clientUrl: '#',
    serverUrl: '#',
    description: 'Снапшот 1.9 серії',
    supportedLoaders: ['vanilla'],
  },
  {
    id: '15w42a',
    version: '15w42a',
    type: 'snapshot',
    releaseDate: '2015-10-14',
    clientUrl: '#',
    serverUrl: '#',
    description: 'Снапшот 1.9 серії',
    supportedLoaders: ['vanilla'],
  },
  {
    id: '15w41a',
    version: '15w41a',
    type: 'snapshot',
    releaseDate: '2015-10-07',
    clientUrl: '#',
    serverUrl: '#',
    description: 'Снапшот 1.9 серії',
    supportedLoaders: ['vanilla'],
  },
  {
    id: '15w40a',
    version: '15w40a',
    type: 'snapshot',
    releaseDate: '2015-09-30',
    clientUrl: '#',
    serverUrl: '#',
    description: 'Снапшот 1.9 серії',
    supportedLoaders: ['vanilla'],
  },
  {
    id: '15w39a',
    version: '15w39a',
    type: 'snapshot',
    releaseDate: '2015-09-23',
    clientUrl: '#',
    serverUrl: '#',
    description: 'Снапшот 1.9 серії',
    supportedLoaders: ['vanilla'],
  },
  {
    id: '15w38a',
    version: '15w38a',
    type: 'snapshot',
    releaseDate: '2015-09-16',
    clientUrl: '#',
    serverUrl: '#',
    description: 'Снапшот 1.9 серії',
    supportedLoaders: ['vanilla'],
  },
  {
    id: '15w37a',
    version: '15w37a',
    type: 'snapshot',
    releaseDate: '2015-09-09',
    clientUrl: '#',
    serverUrl: '#',
    description: 'Снапшот 1.9 серії',
    supportedLoaders: ['vanilla'],
  },
  {
    id: '15w36a',
    version: '15w36a',
    type: 'snapshot',
    releaseDate: '2015-09-02',
    clientUrl: '#',
    serverUrl: '#',
    description: 'Снапшот 1.9 серії',
    supportedLoaders: ['vanilla'],
  },
  {
    id: '15w35a',
    version: '15w35a',
    type: 'snapshot',
    releaseDate: '2015-08-26',
    clientUrl: '#',
    serverUrl: '#',
    description: 'Снапшот 1.9 серії',
    supportedLoaders: ['vanilla'],
  },
  {
    id: '15w34a',
    version: '15w34a',
    type: 'snapshot',
    releaseDate: '2015-08-19',
    clientUrl: '#',
    serverUrl: '#',
    description: 'Снапшот 1.9 серії',
    supportedLoaders: ['vanilla'],
  },
  {
    id: '15w33a',
    version: '15w33a',
    type: 'snapshot',
    releaseDate: '2015-08-12',
    clientUrl: '#',
    serverUrl: '#',
    description: 'Снапшот 1.9 серії',
    supportedLoaders: ['vanilla'],
  },
  {
    id: '15w32a',
    version: '15w32a',
    type: 'snapshot',
    releaseDate: '2015-08-05',
    clientUrl: '#',
    serverUrl: '#',
    description: 'Снапшот 1.9 серії',
    supportedLoaders: ['vanilla'],
  },
  {
    id: '15w31c',
    version: '15w31c',
    type: 'snapshot',
    releaseDate: '2015-07-31',
    clientUrl: '#',
    serverUrl: '#',
    description: 'Снапшот 1.8 серії',
    supportedLoaders: ['vanilla'],
  },
  {
    id: '15w14a',
    version: '15w14a',
    type: 'snapshot',
    releaseDate: '2015-04-01',
    clientUrl: '#',
    serverUrl: '#',
    description: 'Снапшот 1.8 серії (April Fools)',
    supportedLoaders: ['vanilla'],
  },
  // 1.6-1.8 Era Snapshots (2013-2014)
  {
    id: '14w34d',
    version: '14w34d',
    type: 'snapshot',
    releaseDate: '2014-08-27',
    clientUrl: '#',
    serverUrl: '#',
    description: 'Снапшот 1.8 серії',
    supportedLoaders: ['vanilla'],
  },
  {
    id: '14w33a',
    version: '14w33a',
    type: 'snapshot',
    releaseDate: '2014-08-13',
    clientUrl: '#',
    serverUrl: '#',
    description: 'Снапшот 1.8 серії',
    supportedLoaders: ['vanilla'],
  },
  {
    id: '14w32a',
    version: '14w32a',
    type: 'snapshot',
    releaseDate: '2014-08-06',
    clientUrl: '#',
    serverUrl: '#',
    description: 'Снапшот 1.8 серії',
    supportedLoaders: ['vanilla'],
  },
  {
    id: '14w31a',
    version: '14w31a',
    type: 'snapshot',
    releaseDate: '2014-07-30',
    clientUrl: '#',
    serverUrl: '#',
    description: 'Снапшот 1.8 серії',
    supportedLoaders: ['vanilla'],
  },
  {
    id: '14w30a',
    version: '14w30a',
    type: 'snapshot',
    releaseDate: '2014-07-23',
    clientUrl: '#',
    serverUrl: '#',
    description: 'Снапшот 1.8 серії',
    supportedLoaders: ['vanilla'],
  },
  {
    id: '14w29a',
    version: '14w29a',
    type: 'snapshot',
    releaseDate: '2014-07-16',
    clientUrl: '#',
    serverUrl: '#',
    description: 'Снапшот 1.8 серії',
    supportedLoaders: ['vanilla'],
  },
  {
    id: '14w28a',
    version: '14w28a',
    type: 'snapshot',
    releaseDate: '2014-07-09',
    clientUrl: '#',
    serverUrl: '#',
    description: 'Снапшот 1.8 серії',
    supportedLoaders: ['vanilla'],
  },
  {
    id: '14w27a',
    version: '14w27a',
    type: 'snapshot',
    releaseDate: '2014-07-02',
    clientUrl: '#',
    serverUrl: '#',
    description: 'Снапшот 1.8 серії',
    supportedLoaders: ['vanilla'],
  },
  {
    id: '14w26a',
    version: '14w26a',
    type: 'snapshot',
    releaseDate: '2014-06-25',
    clientUrl: '#',
    serverUrl: '#',
    description: 'Снапшот 1.8 серії',
    supportedLoaders: ['vanilla'],
  },
  {
    id: '14w25a',
    version: '14w25a',
    type: 'snapshot',
    releaseDate: '2014-06-18',
    clientUrl: '#',
    serverUrl: '#',
    description: 'Снапшот 1.8 серії',
    supportedLoaders: ['vanilla'],
  },
  {
    id: '14w21a',
    version: '14w21a',
    type: 'snapshot',
    releaseDate: '2014-05-21',
    clientUrl: '#',
    serverUrl: '#',
    description: 'Снапшот 1.8 серії',
    supportedLoaders: ['vanilla'],
  },
  {
    id: '14w20a',
    version: '14w20a',
    type: 'snapshot',
    releaseDate: '2014-05-14',
    clientUrl: '#',
    serverUrl: '#',
    description: 'Снапшот 1.8 серії',
    supportedLoaders: ['vanilla'],
  },
  {
    id: '14w19a',
    version: '14w19a',
    type: 'snapshot',
    releaseDate: '2014-05-07',
    clientUrl: '#',
    serverUrl: '#',
    description: 'Снапшот 1.8 серії',
    supportedLoaders: ['vanilla'],
  },
  {
    id: '14w18a',
    version: '14w18a',
    type: 'snapshot',
    releaseDate: '2014-04-30',
    clientUrl: '#',
    serverUrl: '#',
    description: 'Снапшот 1.8 серії',
    supportedLoaders: ['vanilla'],
  },
  {
    id: '14w17a',
    version: '14w17a',
    type: 'snapshot',
    releaseDate: '2014-04-23',
    clientUrl: '#',
    serverUrl: '#',
    description: 'Снапшот 1.8 серії',
    supportedLoaders: ['vanilla'],
  },
  {
    id: '14w11a',
    version: '14w11a',
    type: 'snapshot',
    releaseDate: '2014-03-12',
    clientUrl: '#',
    serverUrl: '#',
    description: 'Снапшот 1.8 серії',
    supportedLoaders: ['vanilla'],
  },
  {
    id: '14w10a',
    version: '14w10a',
    type: 'snapshot',
    releaseDate: '2014-03-05',
    clientUrl: '#',
    serverUrl: '#',
    description: 'Снапшот 1.8 серії',
    supportedLoaders: ['vanilla'],
  },
  {
    id: '14w09a',
    version: '14w09a',
    type: 'snapshot',
    releaseDate: '2014-02-26',
    clientUrl: '#',
    serverUrl: '#',
    description: 'Снапшот 1.8 серії',
    supportedLoaders: ['vanilla'],
  },
  {
    id: '14w08a',
    version: '14w08a',
    type: 'snapshot',
    releaseDate: '2014-02-19',
    clientUrl: '#',
    serverUrl: '#',
    description: 'Снапшот 1.8 серії',
    supportedLoaders: ['vanilla'],
  },
  {
    id: '14w07a',
    version: '14w07a',
    type: 'snapshot',
    releaseDate: '2014-02-12',
    clientUrl: '#',
    serverUrl: '#',
    description: 'Снапшот 1.8 серії',
    supportedLoaders: ['vanilla'],
  },
  {
    id: '14w06a',
    version: '14w06a',
    type: 'snapshot',
    releaseDate: '2014-02-05',
    clientUrl: '#',
    serverUrl: '#',
    description: 'Снапшот 1.8 серії',
    supportedLoaders: ['vanilla'],
  },
  {
    id: '14w05a',
    version: '14w05a',
    type: 'snapshot',
    releaseDate: '2014-01-29',
    clientUrl: '#',
    serverUrl: '#',
    description: 'Снапшот 1.8 серії',
    supportedLoaders: ['vanilla'],
  },
  {
    id: '14w04a',
    version: '14w04a',
    type: 'snapshot',
    releaseDate: '2014-01-22',
    clientUrl: '#',
    serverUrl: '#',
    description: 'Снапшот 1.8 серії',
    supportedLoaders: ['vanilla'],
  },
  {
    id: '14w03a',
    version: '14w03a',
    type: 'snapshot',
    releaseDate: '2014-01-15',
    clientUrl: '#',
    serverUrl: '#',
    description: 'Снапшот 1.8 серії',
    supportedLoaders: ['vanilla'],
  },
  {
    id: '14w02a',
    version: '14w02a',
    type: 'snapshot',
    releaseDate: '2014-01-08',
    clientUrl: '#',
    serverUrl: '#',
    description: 'Снапшот 1.8 серії',
    supportedLoaders: ['vanilla'],
  },
  {
    id: '13w49a',
    version: '13w49a',
    type: 'snapshot',
    releaseDate: '2013-12-05',
    clientUrl: '#',
    serverUrl: '#',
    description: 'Снапшот 1.7 серії',
    supportedLoaders: ['vanilla'],
  },
  {
    id: '13w48a',
    version: '13w48a',
    type: 'snapshot',
    releaseDate: '2013-11-27',
    clientUrl: '#',
    serverUrl: '#',
    description: 'Снапшот 1.7 серії',
    supportedLoaders: ['vanilla'],
  },
  {
    id: '13w47a',
    version: '13w47a',
    type: 'snapshot',
    releaseDate: '2013-11-20',
    clientUrl: '#',
    serverUrl: '#',
    description: 'Снапшот 1.7 серії',
    supportedLoaders: ['vanilla'],
  },
  {
    id: '13w43a',
    version: '13w43a',
    type: 'snapshot',
    releaseDate: '2013-10-23',
    clientUrl: '#',
    serverUrl: '#',
    description: 'Снапшот 1.7 серії',
    supportedLoaders: ['vanilla'],
  },
  {
    id: '13w42a',
    version: '13w42a',
    type: 'snapshot',
    releaseDate: '2013-10-16',
    clientUrl: '#',
    serverUrl: '#',
    description: 'Снапшот 1.7 серії',
    supportedLoaders: ['vanilla'],
  },
  {
    id: '13w41a',
    version: '13w41a',
    type: 'snapshot',
    releaseDate: '2013-10-09',
    clientUrl: '#',
    serverUrl: '#',
    description: 'Снапшот 1.7 серії',
    supportedLoaders: ['vanilla'],
  },
  {
    id: '13w39a',
    version: '13w39a',
    type: 'snapshot',
    releaseDate: '2013-09-25',
    clientUrl: '#',
    serverUrl: '#',
    description: 'Снапшот 1.7 серії',
    supportedLoaders: ['vanilla'],
  },
  {
    id: '13w38a',
    version: '13w38a',
    type: 'snapshot',
    releaseDate: '2013-09-18',
    clientUrl: '#',
    serverUrl: '#',
    description: 'Снапшот 1.7 серії',
    supportedLoaders: ['vanilla'],
  },
  {
    id: '13w37a',
    version: '13w37a',
    type: 'snapshot',
    releaseDate: '2013-09-11',
    clientUrl: '#',
    serverUrl: '#',
    description: 'Снапшот 1.7 серії',
    supportedLoaders: ['vanilla'],
  },
  {
    id: '13w36a',
    version: '13w36a',
    type: 'snapshot',
    releaseDate: '2013-09-04',
    clientUrl: '#',
    serverUrl: '#',
    description: 'Снапшот 1.7 серії',
    supportedLoaders: ['vanilla'],
  },
  {
    id: '13w35a',
    version: '13w35a',
    type: 'snapshot',
    releaseDate: '2013-08-28',
    clientUrl: '#',
    serverUrl: '#',
    description: 'Снапшот 1.7 серії',
    supportedLoaders: ['vanilla'],
  },
  {
    id: '13w34a',
    version: '13w34a',
    type: 'snapshot',
    releaseDate: '2013-08-21',
    clientUrl: '#',
    serverUrl: '#',
    description: 'Снапшот 1.7 серії',
    supportedLoaders: ['vanilla'],
  },
  {
    id: '13w33a',
    version: '13w33a',
    type: 'snapshot',
    releaseDate: '2013-08-14',
    clientUrl: '#',
    serverUrl: '#',
    description: 'Снапшот 1.7 серії',
    supportedLoaders: ['vanilla'],
  },
  {
    id: '13w32a',
    version: '13w32a',
    type: 'snapshot',
    releaseDate: '2013-08-07',
    clientUrl: '#',
    serverUrl: '#',
    description: 'Снапшот 1.7 серії',
    supportedLoaders: ['vanilla'],
  },
  {
    id: '13w31a',
    version: '13w31a',
    type: 'snapshot',
    releaseDate: '2013-07-31',
    clientUrl: '#',
    serverUrl: '#',
    description: 'Снапшот 1.7 серії',
    supportedLoaders: ['vanilla'],
  },
  {
    id: '13w30a',
    version: '13w30a',
    type: 'snapshot',
    releaseDate: '2013-07-24',
    clientUrl: '#',
    serverUrl: '#',
    description: 'Снапшот 1.7 серії',
    supportedLoaders: ['vanilla'],
  },
  {
    id: '13w26a',
    version: '13w26a',
    type: 'snapshot',
    releaseDate: '2013-06-27',
    clientUrl: '#',
    serverUrl: '#',
    description: 'Снапшот 1.6 серії',
    supportedLoaders: ['vanilla'],
  },
  {
    id: '13w25a',
    version: '13w25a',
    type: 'snapshot',
    releaseDate: '2013-06-20',
    clientUrl: '#',
    serverUrl: '#',
    description: 'Снапшот 1.6 серії',
    supportedLoaders: ['vanilla'],
  },
  {
    id: '13w24a',
    version: '13w24a',
    type: 'snapshot',
    releaseDate: '2013-06-13',
    clientUrl: '#',
    serverUrl: '#',
    description: 'Снапшот 1.6 серії',
    supportedLoaders: ['vanilla'],
  },
  {
    id: '13w23a',
    version: '13w23a',
    type: 'snapshot',
    releaseDate: '2013-06-06',
    clientUrl: '#',
    serverUrl: '#',
    description: 'Снапшот 1.6 серії',
    supportedLoaders: ['vanilla'],
  },
  {
    id: '13w22a',
    version: '13w22a',
    type: 'snapshot',
    releaseDate: '2013-05-29',
    clientUrl: '#',
    serverUrl: '#',
    description: 'Снапшот 1.6 серії',
    supportedLoaders: ['vanilla'],
  },
  {
    id: '13w21a',
    version: '13w21a',
    type: 'snapshot',
    releaseDate: '2013-05-22',
    clientUrl: '#',
    serverUrl: '#',
    description: 'Снапшот 1.6 серії',
    supportedLoaders: ['vanilla'],
  },
  {
    id: '13w20a',
    version: '13w20a',
    type: 'snapshot',
    releaseDate: '2013-05-15',
    clientUrl: '#',
    serverUrl: '#',
    description: 'Снапшот 1.6 серії',
    supportedLoaders: ['vanilla'],
  },
  {
    id: '13w19a',
    version: '13w19a',
    type: 'snapshot',
    releaseDate: '2013-05-08',
    clientUrl: '#',
    serverUrl: '#',
    description: 'Снапшот 1.6 серії',
    supportedLoaders: ['vanilla'],
  },
  {
    id: '13w18a',
    version: '13w18a',
    type: 'snapshot',
    releaseDate: '2013-05-01',
    clientUrl: '#',
    serverUrl: '#',
    description: 'Снапшот 1.6 серії',
    supportedLoaders: ['vanilla'],
  },
  {
    id: '13w17a',
    version: '13w17a',
    type: 'snapshot',
    releaseDate: '2013-04-24',
    clientUrl: '#',
    serverUrl: '#',
    description: 'Снапшот 1.6 серії',
    supportedLoaders: ['vanilla'],
  },
  {
    id: '13w16a',
    version: '13w16a',
    type: 'snapshot',
    releaseDate: '2013-04-17',
    clientUrl: '#',
    serverUrl: '#',
    description: 'Снапшот 1.6 серії',
    supportedLoaders: ['vanilla'],
  },
  {
    id: '13w12a',
    version: '13w12a',
    type: 'snapshot',
    releaseDate: '2013-03-20',
    clientUrl: '#',
    serverUrl: '#',
    description: 'Снапшот 1.5 серії',
    supportedLoaders: ['vanilla'],
  },
  {
    id: '13w11a',
    version: '13w11a',
    type: 'snapshot',
    releaseDate: '2013-03-13',
    clientUrl: '#',
    serverUrl: '#',
    description: 'Снапшот 1.5 серії',
    supportedLoaders: ['vanilla'],
  },
  {
    id: '13w10a',
    version: '13w10a',
    type: 'snapshot',
    releaseDate: '2013-03-06',
    clientUrl: '#',
    serverUrl: '#',
    description: 'Снапшот 1.5 серії',
    supportedLoaders: ['vanilla'],
  },
  {
    id: '13w09a',
    version: '13w09a',
    type: 'snapshot',
    releaseDate: '2013-02-27',
    clientUrl: '#',
    serverUrl: '#',
    description: 'Снапшот 1.5 серії',
    supportedLoaders: ['vanilla'],
  },
  {
    id: '13w07a',
    version: '13w07a',
    type: 'snapshot',
    releaseDate: '2013-02-13',
    clientUrl: '#',
    serverUrl: '#',
    description: 'Снапшот 1.5 серії',
    supportedLoaders: ['vanilla'],
  },
  {
    id: '13w06a',
    version: '13w06a',
    type: 'snapshot',
    releaseDate: '2013-02-06',
    clientUrl: '#',
    serverUrl: '#',
    description: 'Снапшот 1.5 серії',
    supportedLoaders: ['vanilla'],
  },
  {
    id: '13w05a',
    version: '13w05a',
    type: 'snapshot',
    releaseDate: '2013-01-30',
    clientUrl: '#',
    serverUrl: '#',
    description: 'Снапшот 1.5 серії',
    supportedLoaders: ['vanilla'],
  },
  {
    id: '13w04a',
    version: '13w04a',
    type: 'snapshot',
    releaseDate: '2013-01-23',
    clientUrl: '#',
    serverUrl: '#',
    description: 'Снапшот 1.5 серії',
    supportedLoaders: ['vanilla'],
  },
  {
    id: '13w03a',
    version: '13w03a',
    type: 'snapshot',
    releaseDate: '2013-01-16',
    clientUrl: '#',
    serverUrl: '#',
    description: 'Снапшот 1.5 серії',
    supportedLoaders: ['vanilla'],
  },
  {
    id: '13w02a',
    version: '13w02a',
    type: 'snapshot',
    releaseDate: '2013-01-09',
    clientUrl: '#',
    serverUrl: '#',
    description: 'Снапшот 1.5 серії',
    supportedLoaders: ['vanilla'],
  },
  {
    id: '13w01a',
    version: '13w01a',
    type: 'snapshot',
    releaseDate: '2013-01-02',
    clientUrl: '#',
    serverUrl: '#',
    description: 'Снапшот 1.5 серії',
    supportedLoaders: ['vanilla'],
  },
  // 1.0-1.4 Era Snapshots (2011-2012)
  {
    id: '12w50a',
    version: '12w50a',
    type: 'snapshot',
    releaseDate: '2012-12-12',
    clientUrl: '#',
    serverUrl: '#',
    description: 'Снапшот 1.4 серії',
    supportedLoaders: ['vanilla'],
  },
  {
    id: '12w49a',
    version: '12w49a',
    type: 'snapshot',
    releaseDate: '2012-12-05',
    clientUrl: '#',
    serverUrl: '#',
    description: 'Снапшот 1.4 серії',
    supportedLoaders: ['vanilla'],
  },
  {
    id: '12w42a',
    version: '12w42a',
    type: 'snapshot',
    releaseDate: '2012-10-17',
    clientUrl: '#',
    serverUrl: '#',
    description: 'Снапшот 1.4 серії',
    supportedLoaders: ['vanilla'],
  },
  {
    id: '12w41a',
    version: '12w41a',
    type: 'snapshot',
    releaseDate: '2012-10-10',
    clientUrl: '#',
    serverUrl: '#',
    description: 'Снапшот 1.4 серії',
    supportedLoaders: ['vanilla'],
  },
  {
    id: '12w40a',
    version: '12w40a',
    type: 'snapshot',
    releaseDate: '2012-10-03',
    clientUrl: '#',
    serverUrl: '#',
    description: 'Снапшот 1.4 серії',
    supportedLoaders: ['vanilla'],
  },
  {
    id: '12w39a',
    version: '12w39a',
    type: 'snapshot',
    releaseDate: '2012-09-26',
    clientUrl: '#',
    serverUrl: '#',
    description: 'Снапшот 1.4 серії',
    supportedLoaders: ['vanilla'],
  },
  {
    id: '12w38a',
    version: '12w38a',
    type: 'snapshot',
    releaseDate: '2012-09-19',
    clientUrl: '#',
    serverUrl: '#',
    description: 'Снапшот 1.4 серії',
    supportedLoaders: ['vanilla'],
  },
  {
    id: '12w37a',
    version: '12w37a',
    type: 'snapshot',
    releaseDate: '2012-09-12',
    clientUrl: '#',
    serverUrl: '#',
    description: 'Снапшот 1.4 серії',
    supportedLoaders: ['vanilla'],
  },
  {
    id: '12w36a',
    version: '12w36a',
    type: 'snapshot',
    releaseDate: '2012-09-05',
    clientUrl: '#',
    serverUrl: '#',
    description: 'Снапшот 1.4 серії',
    supportedLoaders: ['vanilla'],
  },
  {
    id: '12w34a',
    version: '12w34a',
    type: 'snapshot',
    releaseDate: '2012-08-22',
    clientUrl: '#',
    serverUrl: '#',
    description: 'Снапшот 1.3 серії',
    supportedLoaders: ['vanilla'],
  },
  {
    id: '12w32a',
    version: '12w32a',
    type: 'snapshot',
    releaseDate: '2012-08-08',
    clientUrl: '#',
    serverUrl: '#',
    description: 'Снапшот 1.3 серії',
    supportedLoaders: ['vanilla'],
  },
  {
    id: '12w30a',
    version: '12w30a',
    type: 'snapshot',
    releaseDate: '2012-07-25',
    clientUrl: '#',
    serverUrl: '#',
    description: 'Снапшот 1.3 серії',
    supportedLoaders: ['vanilla'],
  },
  {
    id: '12w27a',
    version: '12w27a',
    type: 'snapshot',
    releaseDate: '2012-07-04',
    clientUrl: '#',
    serverUrl: '#',
    description: 'Снапшот 1.3 серії',
    supportedLoaders: ['vanilla'],
  },
  {
    id: '12w26a',
    version: '12w26a',
    type: 'snapshot',
    releaseDate: '2012-06-27',
    clientUrl: '#',
    serverUrl: '#',
    description: 'Снапшот 1.3 серії',
    supportedLoaders: ['vanilla'],
  },
  {
    id: '12w25a',
    version: '12w25a',
    type: 'snapshot',
    releaseDate: '2012-06-20',
    clientUrl: '#',
    serverUrl: '#',
    description: 'Снапшот 1.3 серії',
    supportedLoaders: ['vanilla'],
  },
  {
    id: '12w24a',
    version: '12w24a',
    type: 'snapshot',
    releaseDate: '2012-06-13',
    clientUrl: '#',
    serverUrl: '#',
    description: 'Снапшот 1.3 серії',
    supportedLoaders: ['vanilla'],
  },
  {
    id: '12w23a',
    version: '12w23a',
    type: 'snapshot',
    releaseDate: '2012-06-06',
    clientUrl: '#',
    serverUrl: '#',
    description: 'Снапшот 1.3 серії',
    supportedLoaders: ['vanilla'],
  },
  {
    id: '12w22a',
    version: '12w22a',
    type: 'snapshot',
    releaseDate: '2012-05-30',
    clientUrl: '#',
    serverUrl: '#',
    description: 'Снапшот 1.3 серії',
    supportedLoaders: ['vanilla'],
  },
  {
    id: '12w21a',
    version: '12w21a',
    type: 'snapshot',
    releaseDate: '2012-05-23',
    clientUrl: '#',
    serverUrl: '#',
    description: 'Снапшот 1.3 серії',
    supportedLoaders: ['vanilla'],
  },
  {
    id: '12w19a',
    version: '12w19a',
    type: 'snapshot',
    releaseDate: '2012-05-09',
    clientUrl: '#',
    serverUrl: '#',
    description: 'Снапшот 1.2 серії',
    supportedLoaders: ['vanilla'],
  },
  {
    id: '12w18a',
    version: '12w18a',
    type: 'snapshot',
    releaseDate: '2012-05-02',
    clientUrl: '#',
    serverUrl: '#',
    description: 'Снапшот 1.2 серії',
    supportedLoaders: ['vanilla'],
  },
  {
    id: '12w17a',
    version: '12w17a',
    type: 'snapshot',
    releaseDate: '2012-04-25',
    clientUrl: '#',
    serverUrl: '#',
    description: 'Снапшот 1.2 серії',
    supportedLoaders: ['vanilla'],
  },
  {
    id: '12w16a',
    version: '12w16a',
    type: 'snapshot',
    releaseDate: '2012-04-18',
    clientUrl: '#',
    serverUrl: '#',
    description: 'Снапшот 1.2 серії',
    supportedLoaders: ['vanilla'],
  },
  {
    id: '12w15a',
    version: '12w15a',
    type: 'snapshot',
    releaseDate: '2012-04-11',
    clientUrl: '#',
    serverUrl: '#',
    description: 'Снапшот 1.2 серії',
    supportedLoaders: ['vanilla'],
  },
  {
    id: '12w08a',
    version: '12w08a',
    type: 'snapshot',
    releaseDate: '2012-02-22',
    clientUrl: '#',
    serverUrl: '#',
    description: 'Снапшот 1.2 серії',
    supportedLoaders: ['vanilla'],
  },
  {
    id: '12w07a',
    version: '12w07a',
    type: 'snapshot',
    releaseDate: '2012-02-15',
    clientUrl: '#',
    serverUrl: '#',
    description: 'Снапшот 1.2 серії',
    supportedLoaders: ['vanilla'],
  },
  {
    id: '12w06a',
    version: '12w06a',
    type: 'snapshot',
    releaseDate: '2012-02-08',
    clientUrl: '#',
    serverUrl: '#',
    description: 'Снапшот 1.2 серії',
    supportedLoaders: ['vanilla'],
  },
  {
    id: '12w05a',
    version: '12w05a',
    type: 'snapshot',
    releaseDate: '2012-02-01',
    clientUrl: '#',
    serverUrl: '#',
    description: 'Снапшот 1.2 серії',
    supportedLoaders: ['vanilla'],
  },
  {
    id: '12w04a',
    version: '12w04a',
    type: 'snapshot',
    releaseDate: '2012-01-25',
    clientUrl: '#',
    serverUrl: '#',
    description: 'Снапшот 1.2 серії',
    supportedLoaders: ['vanilla'],
  },
  {
    id: '12w03a',
    version: '12w03a',
    type: 'snapshot',
    releaseDate: '2012-01-18',
    clientUrl: '#',
    serverUrl: '#',
    description: 'Снапшот 1.2 серії',
    supportedLoaders: ['vanilla'],
  },
  {
    id: '12w01a',
    version: '12w01a',
    type: 'snapshot',
    releaseDate: '2012-01-04',
    clientUrl: '#',
    serverUrl: '#',
    description: 'Снапшот 1.2 серії',
    supportedLoaders: ['vanilla'],
  },
  {
    id: '11w50a',
    version: '11w50a',
    type: 'snapshot',
    releaseDate: '2011-12-14',
    clientUrl: '#',
    serverUrl: '#',
    description: 'Снапшот 1.1 серії',
    supportedLoaders: ['vanilla'],
  },
  {
    id: '11w49a',
    version: '11w49a',
    type: 'snapshot',
    releaseDate: '2011-12-07',
    clientUrl: '#',
    serverUrl: '#',
    description: 'Снапшот 1.1 серії',
    supportedLoaders: ['vanilla'],
  },
  {
    id: '11w48a',
    version: '11w48a',
    type: 'snapshot',
    releaseDate: '2011-11-30',
    clientUrl: '#',
    serverUrl: '#',
    description: 'Снапшот 1.1 серії',
    supportedLoaders: ['vanilla'],
  },
  {
    id: '11w47a',
    version: '11w47a',
    type: 'snapshot',
    releaseDate: '2011-11-23',
    clientUrl: '#',
    serverUrl: '#',
    description: 'Снапшот 1.1 серії',
    supportedLoaders: ['vanilla'],
  },
  {
    id: '1.21.3',
    version: '1.21.3',
    type: 'release',
    releaseDate: '2024-10-23',
    clientUrl: '#',
    serverUrl: '#',
    description: 'Виправлення багів та покращення стабільності',
    supportedLoaders: ['vanilla', 'forge', 'fabric', 'neoforge', 'quilt'],
  },
  {
    id: '1.21.1',
    version: '1.21.1',
    type: 'release',
    releaseDate: '2024-08-08',
    clientUrl: '#',
    serverUrl: '#',
    description: 'Tricky Trials - перше велике оновлення',
    supportedLoaders: ['vanilla', 'forge', 'fabric', 'neoforge', 'quilt'],
  },
  {
    id: '1.21',
    version: '1.21',
    type: 'release',
    releaseDate: '2024-06-13',
    clientUrl: '#',
    serverUrl: '#',
    description: 'Tricky Trials - нові підземелля та боси',
    supportedLoaders: ['vanilla', 'forge', 'fabric', 'neoforge', 'quilt'],
  },
  {
    id: '1.20.6',
    version: '1.20.6',
    type: 'release',
    releaseDate: '2024-04-29',
    clientUrl: '#',
    serverUrl: '#',
    description: 'Оновлення з новими мобами та блоками',
    supportedLoaders: ['vanilla', 'forge', 'fabric', 'neoforge', 'quilt'],
  },
  {
    id: '1.20.4',
    version: '1.20.4',
    type: 'release',
    releaseDate: '2023-12-07',
    clientUrl: '#',
    serverUrl: '#',
    description: 'Виправлення багів та оптимізація',
    supportedLoaders: ['vanilla', 'forge', 'fabric', 'quilt'],
  },
  {
    id: '1.20.2',
    version: '1.20.2',
    type: 'release',
    releaseDate: '2023-09-21',
    clientUrl: '#',
    serverUrl: '#',
    description: 'Додано нові функції для серверів',
    supportedLoaders: ['vanilla', 'forge', 'fabric', 'quilt'],
  },
  {
    id: '1.20.1',
    version: '1.20.1',
    type: 'release',
    releaseDate: '2023-06-12',
    clientUrl: '#',
    serverUrl: '#',
    description: 'Trails & Tales - археологія та вішні',
    supportedLoaders: ['vanilla', 'forge', 'fabric', 'quilt'],
  },
  {
    id: '1.20',
    version: '1.20',
    type: 'release',
    releaseDate: '2023-06-07',
    clientUrl: '#',
    serverUrl: '#',
    description: 'Trails & Tales - велике оновлення',
    supportedLoaders: ['vanilla', 'forge', 'fabric', 'quilt'],
  },
  {
    id: '1.19.4',
    version: '1.19.4',
    type: 'release',
    releaseDate: '2023-03-14',
    clientUrl: '#',
    serverUrl: '#',
    description: 'Виправлення багів The Wild Update',
    supportedLoaders: ['vanilla', 'forge', 'fabric', 'quilt'],
  },
  {
    id: '1.19.2',
    version: '1.19.2',
    type: 'release',
    releaseDate: '2022-08-05',
    clientUrl: '#',
    serverUrl: '#',
    description: 'Стабільна версія The Wild Update',
    supportedLoaders: ['vanilla', 'forge', 'fabric', 'quilt'],
  },
  {
    id: '1.19',
    version: '1.19',
    type: 'release',
    releaseDate: '2022-06-07',
    clientUrl: '#',
    serverUrl: '#',
    description: 'The Wild Update - глибинні темряви',
    supportedLoaders: ['vanilla', 'forge', 'fabric', 'quilt'],
  },
  {
    id: '1.18.2',
    version: '1.18.2',
    type: 'release',
    releaseDate: '2022-02-28',
    clientUrl: '#',
    serverUrl: '#',
    description: 'Виправлення багів Caves & Cliffs',
    supportedLoaders: ['vanilla', 'forge', 'fabric', 'quilt'],
  },
  {
    id: '1.18.1',
    version: '1.18.1',
    type: 'release',
    releaseDate: '2021-12-10',
    clientUrl: '#',
    serverUrl: '#',
    description: 'Перше оновлення Caves & Cliffs Part 2',
    supportedLoaders: ['vanilla', 'forge', 'fabric'],
  },
  {
    id: '1.18',
    version: '1.18',
    type: 'release',
    releaseDate: '2021-11-30',
    clientUrl: '#',
    serverUrl: '#',
    description: 'Caves & Cliffs Part 2 - нові печери',
    supportedLoaders: ['vanilla', 'forge', 'fabric'],
  },
  {
    id: '1.17.1',
    version: '1.17.1',
    type: 'release',
    releaseDate: '2021-07-06',
    clientUrl: '#',
    serverUrl: '#',
    description: 'Виправлення багів Caves & Cliffs',
    supportedLoaders: ['vanilla', 'forge', 'fabric'],
  },
  {
    id: '1.17',
    version: '1.17',
    type: 'release',
    releaseDate: '2021-06-08',
    clientUrl: '#',
    serverUrl: '#',
    description: 'Caves & Cliffs Part 1 - мідь та аксолотлі',
    supportedLoaders: ['vanilla', 'forge', 'fabric'],
  },
  {
    id: '1.16.5',
    version: '1.16.5',
    type: 'release',
    releaseDate: '2021-01-15',
    clientUrl: '#',
    serverUrl: '#',
    description: 'Стабільна версія Nether Update',
    supportedLoaders: ['vanilla', 'forge', 'fabric'],
  },
  {
    id: '1.16.4',
    version: '1.16.4',
    type: 'release',
    releaseDate: '2020-11-02',
    clientUrl: '#',
    serverUrl: '#',
    description: 'Соціальні екрани та виправлення',
    supportedLoaders: ['vanilla', 'forge'],
  },
  {
    id: '1.16.3',
    version: '1.16.3',
    type: 'release',
    releaseDate: '2020-09-10',
    clientUrl: '#',
    serverUrl: '#',
    description: 'Виправлення багів Nether Update',
    supportedLoaders: ['vanilla', 'forge'],
  },
  {
    id: '1.16.2',
    version: '1.16.2',
    type: 'release',
    releaseDate: '2020-08-11',
    clientUrl: '#',
    serverUrl: '#',
    description: 'Пігліни та бартери',
    supportedLoaders: ['vanilla', 'forge'],
  },
  {
    id: '1.16.1',
    version: '1.16.1',
    type: 'release',
    releaseDate: '2020-06-24',
    clientUrl: '#',
    serverUrl: '#',
    description: 'Виправлення багів Nether Update',
    supportedLoaders: ['vanilla', 'forge'],
  },
  {
    id: '1.16',
    version: '1.16',
    type: 'release',
    releaseDate: '2020-06-23',
    clientUrl: '#',
    serverUrl: '#',
    description: 'Nether Update - новий вимір!',
    supportedLoaders: ['vanilla', 'forge'],
  },
  {
    id: '1.15.2',
    version: '1.15.2',
    type: 'release',
    releaseDate: '2020-01-21',
    clientUrl: '#',
    serverUrl: '#',
    description: 'Стабільна версія Buzzy Bees',
    supportedLoaders: ['vanilla', 'forge'],
  },
  {
    id: '1.14.4',
    version: '1.14.4',
    type: 'release',
    releaseDate: '2019-07-19',
    clientUrl: '#',
    serverUrl: '#',
    description: 'Стабільна версія Village & Pillage',
    supportedLoaders: ['vanilla', 'forge'],
  },
  {
    id: '1.13.2',
    version: '1.13.2',
    type: 'release',
    releaseDate: '2018-10-22',
    clientUrl: '#',
    serverUrl: '#',
    description: 'Стабільна версія Update Aquatic',
    supportedLoaders: ['vanilla', 'forge'],
  },
  {
    id: '1.12.2',
    version: '1.12.2',
    type: 'release',
    releaseDate: '2017-09-18',
    clientUrl: '#',
    serverUrl: '#',
    description: 'Найпопулярніша версія для модів!',
    supportedLoaders: ['vanilla', 'forge'],
  },
  {
    id: '1.12.1',
    version: '1.12.1',
    type: 'release',
    releaseDate: '2017-08-03',
    clientUrl: '#',
    serverUrl: '#',
    description: 'Виправлення багів World of Color',
    supportedLoaders: ['vanilla', 'forge'],
  },
  {
    id: '1.12',
    version: '1.12',
    type: 'release',
    releaseDate: '2017-06-07',
    clientUrl: '#',
    serverUrl: '#',
    description: 'World of Color - бетон та попугаї',
    supportedLoaders: ['vanilla', 'forge'],
  },
  {
    id: '1.11.2',
    version: '1.11.2',
    type: 'release',
    releaseDate: '2016-12-21',
    clientUrl: '#',
    serverUrl: '#',
    description: 'Стабільна версія Exploration Update',
    supportedLoaders: ['vanilla', 'forge'],
  },
  {
    id: '1.10.2',
    version: '1.10.2',
    type: 'release',
    releaseDate: '2016-08-01',
    clientUrl: '#',
    serverUrl: '#',
    description: 'Стабільна версія Frostburn Update',
    supportedLoaders: ['vanilla', 'forge'],
  },
  {
    id: '1.9.4',
    version: '1.9.4',
    type: 'release',
    releaseDate: '2016-05-10',
    clientUrl: '#',
    serverUrl: '#',
    description: 'Стабільна версія Combat Update',
    supportedLoaders: ['vanilla', 'forge'],
  },
  {
    id: '1.8.9',
    version: '1.8.9',
    type: 'release',
    releaseDate: '2015-12-09',
    clientUrl: '#',
    serverUrl: '#',
    description: 'Популярна версія для PvP серверів!',
    supportedLoaders: ['vanilla', 'forge'],
  },
  {
    id: '1.8',
    version: '1.8',
    type: 'release',
    releaseDate: '2014-09-02',
    clientUrl: '#',
    serverUrl: '#',
    description: 'Bountiful Update - прапори та кролики',
    supportedLoaders: ['vanilla', 'forge'],
  },
  {
    id: '1.7.10',
    version: '1.7.10',
    type: 'release',
    releaseDate: '2014-06-26',
    clientUrl: '#',
    serverUrl: '#',
    description: 'Легендарна версія для модів!',
    supportedLoaders: ['vanilla', 'forge'],
  },
  {
    id: '1.7.2',
    version: '1.7.2',
    type: 'release',
    releaseDate: '2013-10-25',
    clientUrl: '#',
    serverUrl: '#',
    description: 'The Update that Changed the World',
    supportedLoaders: ['vanilla', 'forge'],
  },
  {
    id: '1.6.4',
    version: '1.6.4',
    type: 'release',
    releaseDate: '2013-09-19',
    clientUrl: '#',
    serverUrl: '#',
    description: 'Horse Update - коні та ресурс паки',
    supportedLoaders: ['vanilla', 'forge'],
  },
  {
    id: '1.5.2',
    version: '1.5.2',
    type: 'release',
    releaseDate: '2013-05-02',
    clientUrl: '#',
    serverUrl: '#',
    description: 'Redstone Update - стабільна версія',
    supportedLoaders: ['vanilla', 'forge'],
  },
  {
    id: '1.4.7',
    version: '1.4.7',
    type: 'release',
    releaseDate: '2012-12-28',
    clientUrl: '#',
    serverUrl: '#',
    description: 'Pretty Scary Update - стабільна версія',
    supportedLoaders: ['vanilla'],
  },
  {
    id: '1.3.2',
    version: '1.3.2',
    type: 'release',
    releaseDate: '2012-08-16',
    clientUrl: '#',
    serverUrl: '#',
    description: 'Стабільна версія',
    supportedLoaders: ['vanilla'],
  },
  {
    id: '1.2.5',
    version: '1.2.5',
    type: 'release',
    releaseDate: '2012-04-04',
    clientUrl: '#',
    serverUrl: '#',
    description: 'Класична версія для старих серверів',
    supportedLoaders: ['vanilla'],
  },
  {
    id: '1.1',
    version: '1.1',
    type: 'release',
    releaseDate: '2012-01-12',
    clientUrl: '#',
    serverUrl: '#',
    description: 'Одна з перших релізних версій',
    supportedLoaders: ['vanilla'],
  },
  {
    id: '1.0',
    version: '1.0',
    type: 'release',
    releaseDate: '2011-11-18',
    clientUrl: '#',
    serverUrl: '#',
    description: 'Офіційний реліз Minecraft!',
    supportedLoaders: ['vanilla'],
  },
  {
    id: '24w51a',
    version: '24w51a',
    type: 'snapshot',
    releaseDate: '2024-12-19',
    clientUrl: '#',
    serverUrl: '#',
    description: 'Снапшот - тестова версія',
    supportedLoaders: ['vanilla', 'fabric'],
  },
  {
    id: '24w50a',
    version: '24w50a',
    type: 'snapshot',
    releaseDate: '2024-12-12',
    clientUrl: '#',
    serverUrl: '#',
    description: 'Снапшот - тестова версія',
    supportedLoaders: ['vanilla', 'fabric'],
  },
  {
    id: '24w49a',
    version: '24w49a',
    type: 'snapshot',
    releaseDate: '2024-12-05',
    clientUrl: '#',
    serverUrl: '#',
    description: 'Снапшот - тестова версія',
    supportedLoaders: ['vanilla', 'fabric'],
  },
];

function App() {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedType, setSelectedType] = useState<'all' | 'release' | 'snapshot'>('all');
  const [activeTab, setActiveTab] = useState<'client' | 'server'>('client');
  const [selectedLoader, setSelectedLoader] = useState<string>('vanilla');
  const [showLoaderModal, setShowLoaderModal] = useState(false);
  const [selectedVersionForLoader, setSelectedVersionForLoader] = useState<MinecraftVersion | null>(null);
  const [selectedServerType, setSelectedServerType] = useState<string>('all');
  const [showServerModal, setShowServerModal] = useState(false);
  const [selectedVersionForServer, setSelectedVersionForServer] = useState<MinecraftVersion | null>(null);
  const [downloadProgress, setDownloadProgress] = useState<{show: boolean; message: string; progress: number}>({show: false, message: '', progress: 0});

  const filteredVersions = useMemo(() => {
    // Фільтруємо за пошуком і табом
    const searched = minecraftVersions.filter((version) => {
      const matchesSearch = version.version.toLowerCase().includes(searchQuery.toLowerCase()) ||
        version.description.toLowerCase().includes(searchQuery.toLowerCase());
      
      // Для серверів прибираємо снапшоти
      if (activeTab === 'server' && version.type === 'snapshot') {
        return false;
      }
      
      return matchesSearch;
    });
    
    // Фільтр за типом
    let filtered;
    if (selectedType === 'release') {
      filtered = searched.filter(v => v.type === 'release');
    } else if (selectedType === 'snapshot') {
      filtered = searched.filter(v => v.type === 'snapshot');
    } else {
      filtered = [...searched]; // копіюємо масив
    }
    
    console.log('=== ФІЛЬТР ===', {
      selectedType,
      activeTab,
      total: filtered.length,
      snapshots: filtered.filter(v => v.type === 'snapshot').length,
      releases: filtered.filter(v => v.type === 'release').length
    });
    
    // Сортуємо версії від найновішої до найстарішої
    const sorted = [...filtered].sort((a, b) => {
      // Якщо обрано тільки снапшоти, сортуємо їх між собою
      if (selectedType === 'snapshot') {
        // Сортуємо снапшоти від найновіших до найстаріших
        return b.id.localeCompare(a.id);
      }
      
      // Якщо обрано тільки релізи, сортуємо їх між собою
      if (selectedType === 'release') {
        const aParts = a.version.replace(/[^\d.]/g, '').split('.').map(Number);
        const bParts = b.version.replace(/[^\d.]/g, '').split('.').map(Number);
        
        if (aParts[0] !== bParts[0]) {
          if (aParts[0] >= 26 && bParts[0] < 26) return -1;
          if (aParts[0] < 26 && bParts[0] >= 26) return 1;
          return bParts[0] - aParts[0];
        }
        
        if (aParts.length > 1 && bParts.length > 1 && aParts[1] !== bParts[1]) {
          return bParts[1] - aParts[1];
        }
        
        if (aParts.length > 2 && bParts.length > 2 && aParts[2] !== bParts[2]) {
          return bParts[2] - aParts[2];
        }
        
        return 0;
      }
      
      // Якщо 'all' - спочатку релізи, потім снапшоти
      const aIsSnapshot = a.type === 'snapshot';
      const bIsSnapshot = b.type === 'snapshot';
      
      if (aIsSnapshot && !bIsSnapshot) return 1;
      if (!aIsSnapshot && bIsSnapshot) return -1;
      
      // Парсимо версії для порівняння
      const aParts = a.version.replace(/[^\d.]/g, '').split('.').map(Number);
      const bParts = b.version.replace(/[^\d.]/g, '').split('.').map(Number);
      
      if (aParts[0] !== bParts[0]) {
        if (aParts[0] >= 26 && bParts[0] < 26) return -1;
        if (aParts[0] < 26 && bParts[0] >= 26) return 1;
        return bParts[0] - aParts[0];
      }
      
      if (aParts.length > 1 && bParts.length > 1 && aParts[1] !== bParts[1]) {
        return bParts[1] - aParts[1];
      }
      
      if (aParts.length > 2 && bParts.length > 2 && aParts[2] !== bParts[2]) {
        return bParts[2] - aParts[2];
      }
      
      return 0;
    });
    
    return sorted;
  }, [searchQuery, selectedType, activeTab]);

  const filteredServerSoftware = useMemo(() => {
    return serverSoftware.filter((software) => {
      if (selectedServerType === 'all') return true;
      return software.type === selectedServerType;
    });
  }, [selectedServerType]);

  const getVersionBadgeColor = (type: string) => {
    switch (type) {
      case 'release':
        return 'bg-emerald-500';
      case 'snapshot':
        return 'bg-amber-500';
      case 'beta':
        return 'bg-blue-500';
      case 'alpha':
        return 'bg-purple-500';
      default:
        return 'bg-gray-500';
    }
  };

  const getVersionBadgeText = (type: string) => {
    switch (type) {
      case 'release':
        return 'Реліз';
      case 'snapshot':
        return 'Снапшот';
      case 'beta':
        return 'Бета';
      case 'alpha':
        return 'Альфа';
      default:
        return type;
    }
  };

  const getLoaderById = (id: string) => {
    return modLoaders.find(loader => loader.id === id) || modLoaders[0];
  };

  const getServerSoftwareById = (id: string) => {
    return serverSoftware.find(software => software.id === id) || serverSoftware[0];
  };

  const getServerTypeBadge = (type: string) => {
    const badges: Record<string, { color: string; text: string }> = {
      vanilla: { color: 'bg-green-500', text: 'Vanilla' },
      plugin: { color: 'bg-orange-500', text: 'Плагіни' },
      mod: { color: 'bg-red-500', text: 'Моди' },
      hybrid: { color: 'bg-purple-500', text: 'Гібрид' },
      optimized: { color: 'bg-blue-500', text: 'Оптимізований' },
    };
    return badges[type] || { color: 'bg-gray-500', text: type };
  };

  // Функція для створення та завантаження файлу
  const downloadFile = (content: Blob, filename: string) => {
    const url = URL.createObjectURL(content);
    const link = document.createElement('a');
    link.href = url;
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  // Функція для створення та завантаження ZIP архіву сервера
  const downloadServerZip = async (serverName: string, version: string, serverType: string) => {
    const zip = new JSZip();
    
    // Додаємо серверне ядро (імітація)
    const serverJarContent = `Minecraft Server ${serverName}
Version: ${version}
Type: ${serverType}

Це серверне ядро ${serverName}.
Для запуску використайте команду:
java -Xmx4G -Xms2G -jar server.jar nogui

Повна інструкція у файлі Readme.txt`;
    zip.file('server.jar', serverJarContent);
    
    // Додаємо інформаційний файл про тип сервера
    const serverTypeInfo = serverType === 'plugin' || serverType === 'optimized' || serverType === 'vanilla'
      ? `Тип сервера: ${serverType.toUpperCase()}
      
Цей сервер підтримує ТІЛЬКИ ПЛАГІНИ.
Папка mods відсутня, оскільки цей тип сервера не підтримує моди.

Якщо вам потрібні моди, оберіть:
- Forge
- Fabric
- NeoForge
- Quilt
- Або гібридний сервер (Mohist, Magma, CatServer, тощо)`
      : `Тип сервера: ${serverType.toUpperCase()}

Цей сервер підтримує моди та/або плагіни.`;
    zip.file('SERVER_TYPE.txt', serverTypeInfo);
    
    // Додаємо папку для плагінів (для всіх типів)
    const pluginsFolder = zip.folder('plugins');
    if (pluginsFolder) {
      if (serverType === 'plugin' || serverType === 'optimized' || serverType === 'vanilla') {
        pluginsFolder.file('.gitkeep', 'Папка для плагінів (.jar файли)');
      } else {
        pluginsFolder.file('.gitkeep', 'Папка для плагінів');
      }
    }
    
    // Додаємо папку для модів ТІЛЬКИ для модових та гібридних серверів
    if (serverType === 'mod' || serverType === 'hybrid') {
      const modsFolder = zip.folder('mods');
      if (modsFolder) modsFolder.file('.gitkeep', 'Папка для модів');
    }
    
    // Додаємо конфігураційні файли
    const serverProperties = `# Minecraft Server Properties
# ${serverName} v${version}
motd=${serverName} Server
max-players=20
difficulty=normal
gamemode=survival
pvp=true
spawn-protection=16
view-distance=10
online-mode=true
white-list=false
enforce-whitelist=false
server-port=25565
server-ip=
level-name=world
level-seed=
level-type=minecraft:normal
spawn-npcs=true
spawn-animals=true
spawn-monsters=true
`;
    zip.file('server.properties', serverProperties);
    
    // Додаємо EULA файл
    const eulaContent = `#By changing the setting below to TRUE you are indicating your agreement to our EULA (https://aka.ms/MinecraftEULA).
eula=false
`;
    zip.file('eula.txt', eulaContent);
    
    // Додаємо start скрипти
    const startBat = `@echo off
java -Xmx4G -Xms2G -jar server.jar nogui
pause
`;
    zip.file('start.bat', startBat);
    
    const startSh = `#!/bin/bash
java -Xmx4G -Xms2G -jar server.jar nogui
`;
    zip.file('start.sh', startSh);
    
    // Додаємо Readme.txt
    const readmeContent = createReadmeContent(serverName, version, serverType);
    zip.file('Readme.txt', readmeContent);
    
    // Генеруємо та завантажуємо ZIP
    const content = await zip.generateAsync({type: 'blob'});
    downloadFile(content, `Server_${serverName}_${version}.zip`);
  };

  // Функція для створення Readme.txt з інструкцією
  const createReadmeContent = (serverName: string, version: string, serverType: string) => {
    return `================================================================================
                    MINECRAFT CORE INSTALLER
                    ${serverName} - Версія ${version}
================================================================================

📋 ІНСТРУКЦІЯ З ВСТАНОВЛЕННЯ СЕРВЕРА

================================================================================
КРОК 1: ПІДГОТОВКА
================================================================================

1. Створіть нову папку для вашого сервера
2. Помістіть завантажений файл інсталятора у цю папку
3. Переконайтеся, що у вас встановлена Java 17 або новіша

   Перевірити версію Java: java -version
   
   Якщо Java не встановлена, завантажте з: https://adoptium.net/

================================================================================
КРОК 2: ВСТАНОВЛЕННЯ
================================================================================

1. Запустіть інсталятор двічі клікнувши по файлу
2. Оберіть папку для встановлення сервера
3. Натисніть "Install" та зачекайте завершення
4. Після встановлення у папці з'являться всі необхідні файли

================================================================================
КРОК 3: ПЕРШИЙ ЗАПУСК
================================================================================

1. Відкрийте термінал/командний рядок у папці сервера
2. Виконайте команду:
   
   Windows:
   java -Xmx4G -Xms2G -jar server.jar nogui
   
   Linux/Mac:
   java -Xmx4G -Xms2G -jar server.jar nogui

3. При першому запуску сервер створить необхідні файли та зупиниться

================================================================================
КРОК 4: НАЛАШТУВАННЯ EULA
================================================================================

1. Відкрийте файл eula.txt у папці сервера
2. Змініть рядок: eula=false на eula=true
3. Збережіть файл

================================================================================
КРОК 5: ЗАПУСК СЕРВЕРА
================================================================================

1. Запустіть сервер повторно командою з Кроку 3
2. Зачекайте повного завантаження (з'явиться повідомлення "Done!")
3. Сервер готовий до підключення!

   Підключення: localhost (для локального тестування)
   
================================================================================
ДОДАТКОВІ НАЛАШТУВАННЯ
================================================================================

📁 server.properties - основні налаштування сервера
📁 ops.json - список операторів сервера
📁 whitelist.json - білий список гравців
📁 banned-players.json - забанені гравці

🔧 Рекомендуємо налаштувати:
   - max-players (максимальна кількість гравців)
   - difficulty (складність гри)
   - gamemode (режим гри за замовчуванням)
   - spawn-protection (захист зони спавну)

================================================================================
ТИП СЕРВЕРА: ${serverType.toUpperCase()}
================================================================================

${serverType === 'mod' ? `
🎮 Цей сервер підтримує МОДИ!

Встановлення модів:
1. Завантажте моди з перевірених джерел
2. Помістіть .jar файли модів у папку "mods"
3. Переконайтеся, що моди сумісні з версією ${version}
4. Запустіть сервер

Популярні джерела модів:
- CurseForge: https://curseforge.com/minecraft/mc-mods
- Modrinth: https://modrinth.com/mods
` : ''}

${serverType === 'plugin' || serverType === 'hybrid' ? `
🔌 Цей сервер підтримує ПЛАГІНИ!

Встановлення плагінів:
1. Завантажте плагіни (.jar файли)
2. Помістіть плагіни у папку "plugins"
3. Перезапустіть сервер
4. Налаштуйте конфігурацію плагінів у папці plugins

Популярні джерела плагінів:
- SpigotMC: https://spigotmc.org/resources/
- Hangar: https://hangar.papermc.io/
- Modrinth: https://modrinth.com/plugins
` : ''}

${serverType === 'hybrid' ? `
⚡ ГІБРИДНИЙ СЕРВЕР - підтримує і МОДИ, і ПЛАГІНИ!

Цей тип сервера поєднує можливості Forge та Bukkit/Spigot.
Ви можете використовувати як моди, так і плагіни одночасно!

Важливо: Деякі моди можуть бути несумісні з плагінами.
Тестуйте сумісність перед використанням на продуктивному сервері.
` : ''}

================================================================================
ВИРІШЕННЯ ПРОБЛЕМ
================================================================================

❌ Сервер не запускається:
   - Перевірте версію Java (потрібна Java 17+)
   - Переконайтеся, що eula.txt прийнято (eula=true)
   - Перевірте, чи не зайнятий порт 25565

❌ Сервер лагає:
   - Збільште виділену пам'ять (-Xmx параметр)
   - Зменшіть view-distance у server.properties
   - Встановіть плагіни оптимізації

❌ Гравці не можуть підключитися:
   - Відкрийте порт 25565 у фаєрволі
   - Налаштуйте переадресацію портів на роутері
   - Перевірте, чи правильно вказана IP-адреса

================================================================================
КОРИСНІ КОМАНДИ КОНСОЛІ
================================================================================

stop     - Безпечно зупинити сервер
save-all - Зберегти світ
op <гравець> - Дати права оператора
whitelist add <гравець> - Додати у білий список
ban <гравець> - Забанити гравця
kick <гравець> - Викинути гравця
gamemode <режим> <гравець> - Змінити режим гри

================================================================================
ПІДТРИМКА ТА РЕСУРСИ
================================================================================

📧 Технічна підтримка: support@minecraft-core-installer.com
🌐 Офіційний сайт: https://minecraft-core-installer.com
💬 Discord спільнота: https://discord.gg/minecraft-core

📚 Корисні ресурси:
   - Minecraft Wiki: https://minecraft.wiki/
   - Spigot Documentation: https://docs.papermc.io/
   - Forge Documentation: https://docs.minecraftforge.net/

================================================================================
                    ДЯКУЄМО ЗА ВИКОРИСТАННЯ MINECRAFT CORE INSTALLER!
                    Бажаємо приємної гри! 🎮
================================================================================

Версія інсталятора: 2.0.0
Дата оновлення: 2024
`;
  };

  // Функція для завантаження модового сервера (інсталятор + Readme)
  const downloadModServer = async (serverName: string, version: string, serverType: string) => {
    // Створюємо ZIP з інсталятором та Readme
    const zip = new JSZip();
    
    const installerContent = `Minecraft Core Installer
========================
Server: ${serverName}
Version: ${version}
Type: ${serverType}

Це інсталятор сервера.
Запустіть цей файл для встановлення.

Вимоги:
- Java 17 або новіша
- Мінімум 2GB RAM
- 1GB вільного місця на диску`;

    zip.file(`${serverName}_Installer_${version}.jar`, installerContent);
    
    const readmeContent = createReadmeContent(serverName, version, serverType);
    zip.file('Readme.txt', readmeContent);
    
    const content = await zip.generateAsync({type: 'blob'});
    downloadFile(content, `${serverName}_Installer_${version}.zip`);
  };

  const handleDownloadClick = (version: MinecraftVersion) => {
    if (activeTab === 'client' && version.supportedLoaders.length > 1) {
      setSelectedVersionForLoader(version);
      setShowLoaderModal(true);
    } else if (activeTab === 'server') {
      setSelectedVersionForServer(version);
      setShowServerModal(true);
    } else {
      alert(`Завантаження ${activeTab === 'client' ? 'клієнта' : 'сервера'} версії ${version.version} почнеться незабаром!`);
    }
  };

  const handleLoaderSelect = async (loaderId: string) => {
    if (selectedVersionForLoader) {
      const loader = getLoaderById(loaderId);
      setDownloadProgress({show: true, message: `Завантаження ${loader.name} для ${selectedVersionForLoader.version}...`, progress: 0});
      
      let progress = 0;
      const interval = setInterval(async () => {
        progress += 10;
        setDownloadProgress(prev => ({...prev, progress}));
        if (progress >= 100) {
          clearInterval(interval);
          
          // Створюємо ZIP з клієнтом
          const zip = new JSZip();
          zip.file(`${loader.name}_${selectedVersionForLoader.version}.jar`, `Клієнт ${loader.name} версії ${selectedVersionForLoader.version}`);
          const readmeContent = createReadmeContent(loader.name, selectedVersionForLoader.version, 'client');
          zip.file('Readme.txt', readmeContent);
          
          const content = await zip.generateAsync({type: 'blob'});
          downloadFile(content, `${loader.name}_${selectedVersionForLoader.version}.zip`);
          
          setTimeout(() => setDownloadProgress({show: false, message: '', progress: 0}), 2000);
        }
      }, 200);
      
      setShowLoaderModal(false);
      setSelectedVersionForLoader(null);
    }
  };

  const handleServerSelect = async (serverId: string) => {
    if (selectedVersionForServer) {
      const server = getServerSoftwareById(serverId);
      
      setDownloadProgress({show: true, message: `Підготовка ${server.name} для ${selectedVersionForServer.version}...`, progress: 0});
      
      let progress = 0;
      const interval = setInterval(async () => {
        progress += 5;
        setDownloadProgress(prev => ({...prev, progress}));
        if (progress >= 100) {
          clearInterval(interval);
          
          // Для плагінів та гібридних серверів - Server.zip
          if (server.type === 'plugin' || server.type === 'hybrid') {
            await downloadServerZip(server.name, selectedVersionForServer.version, server.type);
            setDownloadProgress({show: true, message: 'Server.zip завантажено!', progress: 100});
            setTimeout(() => setDownloadProgress({show: false, message: '', progress: 0}), 2000);
          } 
          // Для модових серверів - інсталятор + Readme.txt
          else if (server.type === 'mod') {
            await downloadModServer(server.name, selectedVersionForServer.version, server.type);
            setDownloadProgress({show: true, message: 'Інсталятор та Readme.txt завантажено!', progress: 100});
            setTimeout(() => setDownloadProgress({show: false, message: '', progress: 0}), 2000);
          }
          // Для vanilla та optimized - Server.zip
          else {
            await downloadServerZip(server.name, selectedVersionForServer.version, server.type);
            setDownloadProgress({show: true, message: 'Server.zip завантажено!', progress: 100});
            setTimeout(() => setDownloadProgress({show: false, message: '', progress: 0}), 2000);
          }
        }
      }, 150);
      
      setShowServerModal(false);
      setSelectedVersionForServer(null);
    }
  };

  const getCompatibleServers = (version: string) => {
    return serverSoftware.filter(software => {
      const [major, minor, patch] = version.split('.').map(Number);
      const [minVer, maxVer] = software.versions;
      const [minMajor, minMinor] = minVer.split('.').map(Number);
      const [maxMajor, maxMinor, maxPatch] = maxVer.split('.').map(Number);
      
      const verNum = major * 10000 + minor * 100 + (patch || 0);
      const minNum = minMajor * 10000 + minMinor * 100;
      const maxNum = maxMajor * 10000 + maxMinor * 100 + (maxPatch || 0);
      
      return verNum >= minNum && verNum <= maxNum;
    });
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-900 via-green-950 to-gray-900">
      {/* Header */}
      <header className="border-b border-green-800/50 bg-gray-900/80 backdrop-blur-sm sticky top-0 z-40">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br from-green-500 to-emerald-600 shadow-lg shadow-green-500/30">
                <svg className="h-7 w-7 text-white" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M4 4h4v4H4V4zm6 0h4v4h-4V4zm6 0h4v4h-4V4zM4 10h4v4H4v-4zm6 0h4v4h-4v-4zm6 0h4v4h-4v-4zM4 16h4v4H4v-4zm6 0h4v4h-4v-4zm6 0h4v4h-4v-4z" />
                </svg>
              </div>
              <div>
                <h1 className="text-2xl font-bold text-white">Minecraft-Core-Installer</h1>
                <p className="text-sm text-green-400">Всі версії + 24 типи серверів</p>
              </div>
            </div>
            <nav className="hidden lg:flex items-center gap-6">
              <a href="#versions" className="text-gray-300 hover:text-green-400 transition-colors">Версії</a>
              <a href="#loaders" className="text-gray-300 hover:text-green-400 transition-colors">Модлоадери</a>
              <a href="#server-software" className="text-gray-300 hover:text-green-400 transition-colors">Сервери</a>
              <a href="#about" className="text-gray-300 hover:text-green-400 transition-colors">Про нас</a>
            </nav>
          </div>
        </div>
      </header>

      {/* Download Progress Modal */}
      {downloadProgress.show && (
        <div className="fixed bottom-4 right-4 bg-gray-800 border border-green-500 rounded-xl p-4 shadow-2xl z-50 min-w-[300px]">
          <div className="flex items-center gap-3 mb-2">
            <div className="w-8 h-8 rounded-full bg-green-500/20 flex items-center justify-center">
              <svg className="w-5 h-5 text-green-400 animate-spin" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
            </div>
            <div className="flex-1">
              <p className="text-white font-medium text-sm">{downloadProgress.message}</p>
              <div className="w-full bg-gray-700 rounded-full h-2 mt-2">
                <div 
                  className="bg-green-500 h-2 rounded-full transition-all duration-300"
                  style={{width: `${downloadProgress.progress}%`}}
                ></div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Hero Section */}
      <section className="relative py-20 px-4 overflow-hidden">
        <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+PGRlZnM+PHBhdHRlcm4gaWQ9ImdyaWQiIHdpZHRoPSI2MCIgaGVpZ2h0PSI2MCIgcGF0dGVyblVuaXRzPSJ1c2VyU3BhY2VPblVzZSI+PHBhdGggZD0iTSAxMCAwIEwgMCAwIDAgMTAiIGZpbGw9Im5vbmUiIHN0cm9rZT0iIzIyYzU1ZSIgc3Ryb2tlLW9wYWNpdHk9IjAuMSIgc3Ryb2tlLXdpZHRoPSIxIi8+PC9wYXR0ZXJuPjwvZGVmcz48cmVjdCB3aWR0aD0iMTAwJSIgaGVpZ2h0PSIxMDAlIiBmaWxsPSJ1cmwoI2dyaWQpIi8+PC9zdmc+')] opacity-30"></div>
        <div className="container mx-auto text-center relative z-10">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-green-500/20 border border-green-500/30 text-green-400 text-sm mb-6">
            <span className="w-2 h-2 rounded-full bg-green-400 animate-pulse"></span>
            Остання версія: 1.21.4
          </div>
          <h2 className="text-5xl md:text-6xl font-bold text-white mb-6">
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-green-400 to-emerald-500">Minecraft-Core-Installer</span>
          </h2>
          <p className="text-xl text-gray-400 max-w-3xl mx-auto mb-8">
            Універсальний інсталятор для всіх версій Minecraft від 1.0 до 1.26. 
            26 типів серверного софту: Paper, Spigot, Forge, Fabric, Mohist, Magma, HybridCraft та багато інших!
          </p>
          <div className="flex flex-wrap justify-center gap-4">
            <a 
              href="#versions" 
              className="inline-flex items-center gap-2 px-8 py-4 bg-gradient-to-r from-green-500 to-emerald-600 text-white font-semibold rounded-xl hover:from-green-600 hover:to-emerald-700 transition-all shadow-lg shadow-green-500/30 hover:shadow-green-500/50"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
              </svg>
              Завантажити клієнт
            </a>
            <a 
              href="#server-software" 
              className="inline-flex items-center gap-2 px-8 py-4 bg-gray-800 text-white font-semibold rounded-xl hover:bg-gray-700 transition-all border border-gray-700"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 12h14M5 12a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v4a2 2 0 01-2 2M5 12a2 2 0 00-2 2v4a2 2 0 002 2h14a2 2 0 002-2v-4a2 2 0 00-2-2m-2-4h.01M17 16h.01" />
              </svg>
              Вибрати сервер
            </a>
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-12 px-4 border-y border-green-800/30">
        <div className="container mx-auto">
          <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-8 gap-6">
            <div className="text-center">
              <div className="text-3xl font-bold text-green-400 mb-2">500+</div>
              <div className="text-gray-400 text-sm">Версій гри</div>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold text-orange-400 mb-2">26</div>
              <div className="text-gray-400 text-sm">Типи серверів</div>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold text-white">5</div>
              <div className="text-gray-400 text-sm">Модлоадерів</div>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold text-blue-400 mb-2">7</div>
              <div className="text-gray-400 text-sm">Оптимізованих</div>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold text-purple-400 mb-2">7</div>
              <div className="text-gray-400 text-sm">Гібридних</div>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold text-red-400 mb-2">4</div>
              <div className="text-gray-400 text-sm">Для модів</div>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold text-yellow-400 mb-2">4</div>
              <div className="text-gray-400 text-sm">Для плагінів</div>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold text-emerald-400 mb-2">100%</div>
              <div className="text-gray-400 text-sm">Безкоштовно</div>
            </div>
          </div>
        </div>
      </section>

      {/* Mod Loaders Section */}
      <section id="loaders" className="py-16 px-4 bg-gray-800/30">
        <div className="container mx-auto">
          <div className="text-center mb-12">
            <h3 className="text-3xl font-bold text-white mb-4">Модлоадери для клієнта</h3>
            <p className="text-gray-400 max-w-2xl mx-auto">
              Оберіть потрібний модлоадер для встановлення модів на ваш клієнт
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
            {modLoaders.map((loader) => (
              <div
                key={loader.id}
                className={`bg-gray-800 border border-gray-700 rounded-xl p-5 hover:border-gray-600 transition-all ${
                  selectedLoader === loader.id ? 'ring-2 ring-green-500' : ''
                }`}
              >
                <div className="text-center">
                  <div className="text-4xl mb-3">{loader.icon}</div>
                  <h4 className="text-lg font-bold text-white mb-2">{loader.name}</h4>
                  <p className="text-gray-400 text-sm mb-4">{loader.description}</p>
                  <button
                    onClick={() => setSelectedLoader(loader.id)}
                    className={`w-full px-4 py-2 rounded-lg font-medium transition-all ${
                      selectedLoader === loader.id
                        ? 'bg-green-500 text-white'
                        : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
                    }`}
                  >
                    {selectedLoader === loader.id ? 'Обрано' : 'Обрати'}
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Server Software Section */}
      <section id="server-software" className="py-16 px-4">
        <div className="container mx-auto">
          <div className="text-center mb-12">
            <h3 className="text-3xl font-bold text-white mb-4">Серверний софт</h3>
            <p className="text-gray-400 max-w-2xl mx-auto">
              24 типи серверів для будь-яких потреб: від ваніли до гібридних з модами та плагінами
            </p>
          </div>

          {/* Server Type Filter */}
          <div className="flex flex-wrap justify-center gap-2 mb-8">
            <button
              onClick={() => setSelectedServerType('all')}
              className={`px-4 py-2 rounded-lg font-medium transition-all ${
                selectedServerType === 'all'
                  ? 'bg-green-500 text-white'
                  : 'bg-gray-800 text-gray-400 hover:text-white border border-gray-700'
              }`}
            >
              Всі ({serverSoftware.length})
            </button>
            <button
              onClick={() => setSelectedServerType('vanilla')}
              className={`px-4 py-2 rounded-lg font-medium transition-all ${
                selectedServerType === 'vanilla'
                  ? 'bg-green-500 text-white'
                  : 'bg-gray-800 text-gray-400 hover:text-white border border-gray-700'
              }`}
            >
              🟩 Vanilla ({serverSoftware.filter(s => s.type === 'vanilla').length})
            </button>
            <button
              onClick={() => setSelectedServerType('optimized')}
              className={`px-4 py-2 rounded-lg font-medium transition-all ${
                selectedServerType === 'optimized'
                  ? 'bg-blue-500 text-white'
                  : 'bg-gray-800 text-gray-400 hover:text-white border border-gray-700'
              }`}
            >
              💙 Оптимізовані ({serverSoftware.filter(s => s.type === 'optimized').length})
            </button>
            <button
              onClick={() => setSelectedServerType('plugin')}
              className={`px-4 py-2 rounded-lg font-medium transition-all ${
                selectedServerType === 'plugin'
                  ? 'bg-orange-500 text-white'
                  : 'bg-gray-800 text-gray-400 hover:text-white border border-gray-700'
              }`}
            >
              🧡 Плагіни ({serverSoftware.filter(s => s.type === 'plugin').length})
            </button>
            <button
              onClick={() => setSelectedServerType('mod')}
              className={`px-4 py-2 rounded-lg font-medium transition-all ${
                selectedServerType === 'mod'
                  ? 'bg-red-500 text-white'
                  : 'bg-gray-800 text-gray-400 hover:text-white border border-gray-700'
              }`}
            >
              ❤️ Моди ({serverSoftware.filter(s => s.type === 'mod').length})
            </button>
            <button
              onClick={() => setSelectedServerType('hybrid')}
              className={`px-4 py-2 rounded-lg font-medium transition-all ${
                selectedServerType === 'hybrid'
                  ? 'bg-purple-500 text-white'
                  : 'bg-gray-800 text-gray-400 hover:text-white border border-gray-700'
              }`}
            >
              💜 Гібридні ({serverSoftware.filter(s => s.type === 'hybrid').length})
            </button>
          </div>

          {/* Server Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
            {filteredServerSoftware.map((software) => {
              const badge = getServerTypeBadge(software.type);
              return (
                <div
                  key={software.id}
                  className="bg-gray-800/50 border border-gray-700 rounded-xl p-5 hover:border-green-500/50 hover:bg-gray-800 transition-all group"
                >
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex items-center gap-3">
                      <span className="text-3xl">{software.icon}</span>
                      <div>
                        <h4 className="text-lg font-bold text-white">{software.name}</h4>
                        <span className={`px-2 py-0.5 rounded text-xs font-medium text-white ${badge.color}`}>
                          {badge.text}
                        </span>
                      </div>
                    </div>
                  </div>
                  <p className="text-gray-400 text-sm mb-3">{software.description}</p>
                  <div className="flex flex-wrap gap-1 mb-3">
                    {software.features.slice(0, 3).map((feature, idx) => (
                      <span key={idx} className="px-2 py-0.5 bg-gray-700 rounded text-xs text-gray-300">
                        {feature}
                      </span>
                    ))}
                  </div>
                  <div className="text-xs text-gray-500 mb-3">
                    Версії: {software.versions[0]} - {software.versions[1]}
                  </div>
                  <a
                    href={software.website}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center justify-center gap-2 w-full px-4 py-2.5 bg-gray-700 hover:bg-gray-600 text-white font-medium rounded-lg transition-colors text-sm"
                  >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                    </svg>
                    Завантажити
                  </a>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* Versions Section */}
      <section id="versions" className="py-16 px-4 bg-gray-800/30">
        <div className="container mx-auto">
          <div className="text-center mb-12">
            <h3 className="text-3xl font-bold text-white mb-4">Обери свою версію</h3>
            <p className="text-gray-400 max-w-xl mx-auto">
              Всі офіційні версії Minecraft Java Edition доступні для завантаження
            </p>
          </div>

          {/* Tabs */}
          <div className="flex justify-center mb-8 relative z-10">
            <div className="inline-flex bg-gray-800 rounded-xl p-1 shadow-xl">
              <button
                onClick={() => setActiveTab('client')}
                className={`px-6 py-3 rounded-lg font-medium transition-all cursor-pointer relative z-20 ${
                  activeTab === 'client'
                    ? 'bg-green-500 text-white shadow-lg scale-105'
                    : 'text-gray-400 hover:text-white hover:bg-gray-700'
                }`}
              >
                <span className="flex items-center gap-2">
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17h14a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                  </svg>
                  Клієнт
                </span>
              </button>
              <button
                onClick={() => setActiveTab('server')}
                className={`px-6 py-3 rounded-lg font-medium transition-all cursor-pointer relative z-20 ${
                  activeTab === 'server'
                    ? 'bg-green-500 text-white shadow-lg scale-105'
                    : 'text-gray-400 hover:text-white hover:bg-gray-700'
                }`}
              >
                <span className="flex items-center gap-2">
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 12h14M5 12a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v4a2 2 0 01-2 2M5 12a2 2 0 00-2 2v4a2 2 0 002 2h14a2 2 0 002-2v-4a2 2 0 00-2-2m-2-4h.01M17 16h.01" />
                  </svg>
                  Сервер
                </span>
              </button>
            </div>
          </div>

          {/* Search and Filter */}
          <div className="flex flex-col md:flex-row gap-4 mb-8 max-w-4xl mx-auto">
            <div className="flex-1 relative">
              <svg className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
              <input
                type="text"
                placeholder="Пошук версії..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-12 pr-4 py-3 bg-gray-800 border border-gray-700 rounded-xl text-white placeholder-gray-400 focus:outline-none focus:border-green-500 focus:ring-2 focus:ring-green-500/20"
              />
            </div>
            <div className="flex gap-2">
              <button
                onClick={() => setSelectedType('all')}
                className={`px-4 py-3 rounded-xl font-medium transition-all ${
                  selectedType === 'all'
                    ? 'bg-green-500 text-white'
                    : 'bg-gray-800 text-gray-400 hover:text-white border border-gray-700'
                }`}
              >
                Всі
              </button>
              <button
                onClick={() => setSelectedType('release')}
                className={`px-4 py-3 rounded-xl font-medium transition-all ${
                  selectedType === 'release'
                    ? 'bg-emerald-500 text-white'
                    : 'bg-gray-800 text-gray-400 hover:text-white border border-gray-700'
                }`}
              >
                Релізи
              </button>
              {activeTab === 'client' && (
                <button
                  onClick={() => setSelectedType('snapshot')}
                  className={`px-4 py-3 rounded-xl font-medium transition-all ${
                    selectedType === 'snapshot'
                      ? 'bg-amber-500 text-white'
                      : 'bg-gray-800 text-gray-400 hover:text-white border border-gray-700'
                  }`}
                >
                  Снапшоти
                </button>
              )}
            </div>
          </div>

          {/* Version Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4" key={`grid-${selectedType}-${activeTab}`}>
            {filteredVersions.map((version) => {
              const compatibleServers = activeTab === 'server' ? getCompatibleServers(version.version) : [];
              return (
                <div
                  key={`${version.id}-${selectedType}`}
                  className="bg-gray-800/50 border border-gray-700 rounded-xl p-5 hover:border-green-500/50 hover:bg-gray-800 transition-all group"
                >
                  <div className="flex items-start justify-between mb-3">
                    <div>
                      <div className="flex items-center gap-2 mb-1">
                        <h4 className="text-xl font-bold text-white">{version.version}</h4>
                        <span className={`px-2 py-0.5 rounded text-xs font-medium text-white ${getVersionBadgeColor(version.type)}`}>
                          {getVersionBadgeText(version.type)}
                        </span>
                      </div>
                      <p className="text-sm text-gray-400">{version.releaseDate}</p>
                    </div>
                  </div>
                  <p className="text-gray-400 text-sm mb-4">{version.description}</p>
                  
                  {/* Mod Loader Badges for Client */}
                  {activeTab === 'client' && version.supportedLoaders.length > 1 && (
                    <div className="flex flex-wrap gap-1 mb-4">
                      {version.supportedLoaders.filter(l => l !== 'vanilla').map((loaderId) => {
                        const loader = getLoaderById(loaderId);
                        return (
                          <span
                            key={loaderId}
                            className={`px-2 py-0.5 rounded text-xs font-medium text-white ${loader.color}`}
                            title={loader.name}
                          >
                            {loader.icon}
                          </span>
                        );
                      })}
                    </div>
                  )}
                  
                  {/* Server Type Badges for Server */}
                  {activeTab === 'server' && compatibleServers.length > 0 && (
                    <div className="flex flex-wrap gap-1 mb-4">
                      {compatibleServers.slice(0, 5).map((server) => {
                        const badge = getServerTypeBadge(server.type);
                        return (
                          <span
                            key={server.id}
                            className={`px-2 py-0.5 rounded text-xs font-medium text-white ${badge.color}`}
                            title={server.name}
                          >
                            {server.icon}
                          </span>
                        );
                      })}
                      {compatibleServers.length > 5 && (
                        <span className="px-2 py-0.5 bg-gray-700 rounded text-xs text-gray-300">
                          +{compatibleServers.length - 5}
                        </span>
                      )}
                    </div>
                  )}
                  
                  <a
                    href={activeTab === 'client' ? version.clientUrl : version.serverUrl}
                    className="inline-flex items-center gap-2 w-full justify-center px-4 py-3 bg-green-600 hover:bg-green-500 text-white font-medium rounded-lg transition-colors group-hover:shadow-lg group-hover:shadow-green-500/20"
                    onClick={(e) => {
                      e.preventDefault();
                      handleDownloadClick(version);
                    }}
                  >
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                    </svg>
                    Завантажити {activeTab === 'client' ? 'клієнт' : 'сервер'}
                  </a>
                </div>
              );
            })}
          </div>

          {filteredVersions.length === 0 && (
            <div className="text-center py-12">
              <svg className="w-16 h-16 mx-auto text-gray-600 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <p className="text-gray-400 text-lg">Версій не знайдено</p>
              <p className="text-gray-500 text-sm mt-1">Спробуйте змінити пошуковий запит</p>
            </div>
          )}
        </div>
      </section>

      {/* Server Setup Guide */}
      <section className="py-16 px-4">
        <div className="container mx-auto max-w-4xl">
          <div className="text-center mb-12">
            <h3 className="text-3xl font-bold text-white mb-4">Як встановити сервер</h3>
            <p className="text-gray-400">Покрокова інструкція для запуску власного сервера</p>
          </div>

          <div className="bg-gray-800/50 border border-gray-700 rounded-xl p-6">
            <div className="space-y-4">
              <div className="flex gap-4">
                <div className="w-8 h-8 rounded-full bg-green-500/20 flex items-center justify-center text-green-400 font-bold text-sm flex-shrink-0">1</div>
                <div>
                  <h5 className="text-white font-medium mb-1">Оберіть тип сервера</h5>
                  <p className="text-gray-400 text-sm">Ваніла, з плагінами, з модами або гібридний</p>
                </div>
              </div>
              <div className="flex gap-4">
                <div className="w-8 h-8 rounded-full bg-green-500/20 flex items-center justify-center text-green-400 font-bold text-sm flex-shrink-0">2</div>
                <div>
                  <h5 className="text-white font-medium mb-1">Завантажте серверний файл</h5>
                  <p className="text-gray-400 text-sm">Для плагінів/гібридних - Server.rar, для модів - інсталятор + Readme.txt</p>
                </div>
              </div>
              <div className="flex gap-4">
                <div className="w-8 h-8 rounded-full bg-green-500/20 flex items-center justify-center text-green-400 font-bold text-sm flex-shrink-0">3</div>
                <div>
                  <h5 className="text-white font-medium mb-1">Розпакуйте архів або запустіть інсталятор</h5>
                  <p className="text-gray-400 text-sm">Слідуйте інструкції у Readme.txt</p>
                </div>
              </div>
              <div className="flex gap-4">
                <div className="w-8 h-8 rounded-full bg-green-500/20 flex items-center justify-center text-green-400 font-bold text-sm flex-shrink-0">4</div>
                <div>
                  <h5 className="text-white font-medium mb-1">Прийміть EULA</h5>
                  <p className="text-gray-400 text-sm">Відкрийте eula.txt та змініть <code className="bg-gray-700 px-2 py-1 rounded text-green-400">eula=false</code> на <code className="bg-gray-700 px-2 py-1 rounded text-green-400">eula=true</code></p>
                </div>
              </div>
              <div className="flex gap-4">
                <div className="w-8 h-8 rounded-full bg-green-500/20 flex items-center justify-center text-green-400 font-bold text-sm flex-shrink-0">5</div>
                <div>
                  <h5 className="text-white font-medium mb-1">Запустіть сервер</h5>
                  <p className="text-gray-400 text-sm">Виконайте команду: <code className="bg-gray-700 px-2 py-1 rounded text-green-400">java -Xmx2G -Xms1G -jar server.jar nogui</code></p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* About Section */}
      <section id="about" className="py-16 px-4 bg-gray-800/30">
        <div className="container mx-auto max-w-4xl">
          <div className="text-center mb-12">
            <h3 className="text-3xl font-bold text-white mb-4">Про Minecraft-Core-Installer</h3>
            <p className="text-gray-400">
              Найповніший інсталятор для Minecraft в Україні
            </p>
          </div>

          <div className="grid md:grid-cols-4 gap-6">
            <div className="bg-gray-800/50 border border-gray-700 rounded-xl p-6 text-center">
              <div className="w-14 h-14 mx-auto mb-4 rounded-xl bg-green-500/20 flex items-center justify-center">
                <svg className="w-7 h-7 text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                </svg>
              </div>
              <h4 className="text-lg font-bold text-white mb-2">Швидко</h4>
              <p className="text-gray-400 text-sm">Автоматичне завантаження файлів</p>
            </div>

            <div className="bg-gray-800/50 border border-gray-700 rounded-xl p-6 text-center">
              <div className="w-14 h-14 mx-auto mb-4 rounded-xl bg-blue-500/20 flex items-center justify-center">
                <svg className="w-7 h-7 text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                </svg>
              </div>
              <h4 className="text-lg font-bold text-white mb-2">Безпечно</h4>
              <p className="text-gray-400 text-sm">Офіційні файли без вірусів</p>
            </div>

            <div className="bg-gray-800/50 border border-gray-700 rounded-xl p-6 text-center">
              <div className="w-14 h-14 mx-auto mb-4 rounded-xl bg-purple-500/20 flex items-center justify-center">
                <svg className="w-7 h-7 text-purple-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 7v10c0 2.21 3.582 4 8 4s8-1.79 8-4V7M4 7c0 2.21 3.582 4 8 4s8-1.79 8-4M4 7c0-2.21 3.582-4 8-4s8 1.79 8 4" />
                </svg>
              </div>
              <h4 className="text-lg font-bold text-white mb-2">Всі версії</h4>
              <p className="text-gray-400 text-sm">Від 1.0 до найновішої</p>
            </div>

            <div className="bg-gray-800/50 border border-gray-700 rounded-xl p-6 text-center">
              <div className="w-14 h-14 mx-auto mb-4 rounded-xl bg-orange-500/20 flex items-center justify-center">
                <svg className="w-7 h-7 text-orange-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
              </div>
              <h4 className="text-lg font-bold text-white mb-2">Readme.txt</h4>
              <p className="text-gray-400 text-sm">Детальна інструкція з встановлення</p>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-green-800/30 bg-gray-900/80 py-12 px-4">
        <div className="container mx-auto">
          <div className="flex flex-col md:flex-row justify-between items-center gap-6">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-green-500 to-emerald-600">
                <svg className="h-6 w-6 text-white" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M4 4h4v4H4V4zm6 0h4v4h-4V4zm6 0h4v4h-4V4zM4 10h4v4H4v-4zm6 0h4v4h-4v-4zm6 0h4v4h-4v-4zM4 16h4v4H4v-4zm6 0h4v4h-4v-4zm6 0h4v4h-4v-4z" />
                </svg>
              </div>
              <div>
                <h4 className="text-white font-semibold">Minecraft-Core-Installer</h4>
                <p className="text-gray-400 text-sm">Версії 1.0 - 1.26 | 26 типів серверів</p>
              </div>
            </div>
            <div className="flex gap-6 text-sm text-gray-400">
              <span>© 2024 Всі права захищено</span>
            </div>
          </div>
          <div className="mt-8 pt-8 border-t border-gray-800 text-center text-gray-500 text-sm">
            <p>Цей сайт не пов'язаний з Mojang Studios або Microsoft. Minecraft є торговою маркою Mojang Synergies AB.</p>
          </div>
        </div>
      </footer>

      {/* Loader Selection Modal */}
      {showLoaderModal && selectedVersionForLoader && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-gray-800 border border-gray-700 rounded-2xl max-w-lg w-full p-6 shadow-2xl">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-2xl font-bold text-white">
                Оберіть модлоадер
              </h3>
              <button
                onClick={() => setShowLoaderModal(false)}
                className="text-gray-400 hover:text-white transition-colors"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
            
            <p className="text-gray-400 mb-6">
              Оберіть модлоадер для версії <span className="text-green-400 font-semibold">{selectedVersionForLoader.version}</span>
            </p>

            <div className="grid grid-cols-2 gap-3 mb-6">
              {selectedVersionForLoader.supportedLoaders.map((loaderId) => {
                const loader = getLoaderById(loaderId);
                return (
                  <button
                    key={loaderId}
                    onClick={() => handleLoaderSelect(loaderId)}
                    className={`p-4 rounded-xl border transition-all ${
                      selectedLoader === loaderId
                        ? 'border-green-500 bg-green-500/20'
                        : 'border-gray-700 bg-gray-700/50 hover:border-gray-600'
                    }`}
                  >
                    <div className="text-3xl mb-2">{loader.icon}</div>
                    <div className="text-white font-semibold">{loader.name}</div>
                    <div className="text-gray-400 text-xs mt-1">{loader.description.split(' ')[0]}</div>
                  </button>
                );
              })}
            </div>

            <div className="flex gap-3">
              <button
                onClick={() => setShowLoaderModal(false)}
                className="flex-1 px-4 py-3 bg-gray-700 hover:bg-gray-600 text-white font-medium rounded-lg transition-colors"
              >
                Скасувати
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Server Selection Modal */}
      {showServerModal && selectedVersionForServer && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-gray-800 border border-gray-700 rounded-2xl max-w-2xl w-full p-6 shadow-2xl max-h-[80vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-2xl font-bold text-white">
                Оберіть тип сервера
              </h3>
              <button
                onClick={() => setShowServerModal(false)}
                className="text-gray-400 hover:text-white transition-colors"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
            
            <p className="text-gray-400 mb-6">
              Доступні сервери для версії <span className="text-green-400 font-semibold">{selectedVersionForServer.version}</span>
            </p>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mb-6">
              {getCompatibleServers(selectedVersionForServer.version).map((server) => {
                const badge = getServerTypeBadge(server.type);
                return (
                  <button
                    key={server.id}
                    onClick={() => handleServerSelect(server.id)}
                    className="p-4 rounded-xl border border-gray-700 bg-gray-700/50 hover:border-gray-600 transition-all text-left"
                  >
                    <div className="flex items-center gap-3 mb-2">
                      <span className="text-2xl">{server.icon}</span>
                      <div>
                        <div className="text-white font-semibold">{server.name}</div>
                        <span className={`px-2 py-0.5 rounded text-xs font-medium text-white ${badge.color}`}>
                          {badge.text}
                        </span>
                      </div>
                    </div>
                    <div className="text-gray-400 text-xs">{server.description}</div>
                  </button>
                );
              })}
            </div>

            <div className="flex gap-3">
              <button
                onClick={() => setShowServerModal(false)}
                className="flex-1 px-4 py-3 bg-gray-700 hover:bg-gray-600 text-white font-medium rounded-lg transition-colors"
              >
                Скасувати
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default App;
