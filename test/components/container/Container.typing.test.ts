import {BaseComponent, Button, Container, Flex, Grid, GridItem} from '../../../src';

describe('Container typing', () => {
  it('preserves concrete return types for generated add* methods', () => {
    const container = new Container();
    const flex = new Flex();
    const grid = new Grid();

    const childFlex = container.addFlex({});
    const childGrid = container.addGrid({});
    const childGridItem = container.addGridItem({});

    const nestedFlex = flex.addFlex({});
    const nestedGrid = grid.addGrid({});
    const nestedGridItem = grid.addGridItem({});

    const flexButton = childFlex.addButton({text: 'flex button'});
    const gridButton = childGrid.addButton({text: 'grid button'});
    const gridItemButton = childGridItem.addButton({text: 'grid item button'});
    const nestedFlexButton = nestedFlex.addButton({text: 'nested flex button'});
    const nestedGridItemButton = nestedGrid.addGridItem({}).addButton({text: 'nested grid item button'});
    const nestedGridButton = nestedGridItem.addButton({text: 'nested grid item button'});

    const typedContainer: Container = childFlex;
    const typedFlex: Flex = nestedFlex;
    const typedGrid: Grid = nestedGrid;
    const typedGridItem: GridItem = nestedGridItem;
    const typedButton: Button = flexButton;
    const typedBase: BaseComponent = gridButton;

    void typedContainer;
    void typedFlex;
    void typedGrid;
    void typedGridItem;
    void typedButton;
    void typedBase;
    void gridItemButton;
    void nestedFlexButton;
    void nestedGridItemButton;
    void nestedGridButton;

    expect(childFlex).toBeInstanceOf(Flex);
    expect(childGrid).toBeInstanceOf(Grid);
    expect(childGridItem).toBeInstanceOf(GridItem);
    expect(nestedFlexButton).toBeInstanceOf(Button);
  });
});

