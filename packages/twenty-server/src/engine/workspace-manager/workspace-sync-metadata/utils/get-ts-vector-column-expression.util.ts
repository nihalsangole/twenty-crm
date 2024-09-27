import { compositeTypeDefinitions } from 'src/engine/metadata-modules/field-metadata/composite-types';
import { FieldMetadataType } from 'src/engine/metadata-modules/field-metadata/field-metadata.entity';
import {
  computeColumnName,
  computeCompositeColumnName,
} from 'src/engine/metadata-modules/field-metadata/utils/compute-column-name.util';
import { isCompositeFieldMetadataType } from 'src/engine/metadata-modules/field-metadata/utils/is-composite-field-metadata-type.util';
import {
  WorkspaceMigrationException,
  WorkspaceMigrationExceptionCode,
} from 'src/engine/metadata-modules/workspace-migration/workspace-migration.exception';

type FieldTypeAndNameMetadata = {
  name: string;
  type: FieldMetadataType;
};

export const getTsVectorColumnExpressionFromFields = (
  fieldsUsedForSearch: FieldTypeAndNameMetadata[],
): string => {
  const columnExpressions = fieldsUsedForSearch.flatMap(
    getColumnExpressionsFromField,
  );
  const concatenatedExpression = columnExpressions.join(" || ' ' || ");

  return `to_tsvector('simple', ${concatenatedExpression})`;
};

const getColumnExpressionsFromField = (
  fieldMetadataTypeAndName: FieldTypeAndNameMetadata,
): string[] => {
  if (isCompositeFieldMetadataType(fieldMetadataTypeAndName.type)) {
    const compositeType = compositeTypeDefinitions.get(
      fieldMetadataTypeAndName.type,
    );

    if (!compositeType) {
      throw new WorkspaceMigrationException(
        `Composite type not found for field metadata type: ${fieldMetadataTypeAndName.type}`,
        WorkspaceMigrationExceptionCode.INVALID_FIELD_METADATA,
      );
    }

    return compositeType.properties
      .filter((property) => property.type === FieldMetadataType.TEXT)
      .map((property) => {
        const columnName = computeCompositeColumnName(
          fieldMetadataTypeAndName,
          property,
        );

        return getColumnExpression(columnName, fieldMetadataTypeAndName.type);
      });
  } else {
    const columnName = computeColumnName(fieldMetadataTypeAndName.name);

    return [getColumnExpression(columnName, fieldMetadataTypeAndName.type)];
  }
};

const getColumnExpression = (
  columnName: string,
  fieldType: FieldMetadataType,
): string => {
  const quotedColumnName = `"${columnName}"`;

  if (fieldType === FieldMetadataType.EMAILS) {
    return `
      COALESCE(
        replace(
          ${quotedColumnName},
          '@',
          ' '
        ),
        ''
      )
    `;
  } else {
    return `COALESCE(${quotedColumnName}, '')`;
  }
};