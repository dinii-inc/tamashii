export const TAMASHII_DIR = ".tamashii";
export const TAMASHII_LINKS_DIR = ".tamashii/.links";
export const TAMASHII_POOLS_DIR = ".tamashii/.pools";

export const TAMASHII_GITIGNORE = `\
/*
!/.gitignore
!/.links
!/.pools
/.links/*
/.pools/*
!/.pools/.gitkeep
!/.links/.gitkeep
`;

export const SCRIPTS_PRE_SYNC = "tamashii:pre-sync";
export const SCRIPTS_POST_SYNC = "tamashii:post-sync";
